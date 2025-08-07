const { supabase } = require('../config/supabase.config');

class AdminModel {
  // =================================================================
  //  TEACHER REQUEST MODELS
  // =================================================================

  async findPendingTeacherRequests({ from, to, sortBy }) {
    const [field, direction] = sortBy.split(':');

    let query = supabase
      .from('teacher_requests')
      .select(
        `
        id,
        status,
        created_at,
        user_id,
        institution
      `,
        { count: 'exact' }
      )
      .eq('status', 'pending')
      .order(field, { ascending: direction === 'asc' });

    if (from !== null && to !== null) {
      query = query.range(from, to);
    }

    // Step 1: Get the pending requests
    const { data: requests, error, count } = await query;
    if (error) return { error };

    if (!requests || requests.length === 0) {
      return { data: [], count: 0 };
    }

    // Step 2: Get the user IDs from the requests
    const userIds = requests.map((r) => r.user_id);

    // Step 3: Fetch the user details for those IDs
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, display_name, email')
      .in('id', userIds);
    if (userError) return { error: userError };

    // Step 4: Map the user details back to their requests
    const usersMap = new Map(users.map((u) => [u.id, u]));
    const finalRequests = requests.map((r) => ({
      requestId: r.id,
      status: r.status,
      submittedAt: r.created_at,
      institution: r.institution,
      user: {
        userId: r.user_id,
        displayName: usersMap.get(r.user_id)?.display_name,
        email: usersMap.get(r.user_id)?.email,
      },
    }));

    return { data: finalRequests, error: null, count };
  }

  async findTeacherRequestById(requestId) {
    // We only need the user_id from the first query
    const { data: request, error } = await supabase
      .from('teacher_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) return { error };
    if (!request) return { data: null };

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, display_name, email')
      .eq('id', request.user_id)
      .single();
    if (userError) return { error: userError };

    // Assemble the final object
    const finalRequest = {
      requestId: request.id,
      status: request.status,
      submittedAt: request.created_at,
      institution: request.institution,
      schoolEmail: request.school_email,
      additionalNotes: request.additional_notes,
      credentials_url: request.credentials_url,
      user: {
        userId: user.id,
        displayName: user.display_name,
        email: user.email,
      },
    };

    return { data: finalRequest, error: null };
  }

  async updateTeacherRequestStatus(requestId, status, adminId, reason = null) {
    return await supabase
      .from('teacher_requests')
      .update({
        status: status,
        reviewed_by: adminId,
        rejection_reason: reason,
      })
      .eq('id', requestId)
      .select()
      .single();
  }

  // =================================================================
  //  CONTENT REPORT MODELS
  // =================================================================

  async findOpenReports({ from, to }) {
    let query = supabase
      .from('reports')
      .select(
        `
        id,
        status,
        created_at,
        word_id,
        reporter_id
      `,
        { count: 'exact' }
      )
      .eq('status', 'open')
      .order('created_at', { ascending: true });

    if (from !== null && to !== null) query = query.range(from, to);

    const { data: reports, error, count } = await query;
    if (error) return { error };
    if (!reports || reports.length === 0) return { data: [], count: 0 };

    // Get unique IDs for related entities
    const wordIds = reports.map((r) => r.word_id);
    const reporterIds = reports.map((r) => r.reporter_id);

    // Fetch related data in parallel
    const [wordsResult, reportersResult] = await Promise.all([
      supabase.from('vocabulary').select('id, term').in('id', wordIds),
      supabase.from('users').select('id, display_name').in('id', reporterIds),
    ]);

    if (wordsResult.error) return { error: wordsResult.error };
    if (reportersResult.error) return { error: reportersResult.error };

    // Map data for easy lookup
    const wordsMap = new Map(wordsResult.data.map((w) => [w.id, w]));
    const reportersMap = new Map(reportersResult.data.map((u) => [u.id, u]));

    const finalReports = reports.map((r) => ({
      reportId: r.id,
      status: r.status,
      reportedAt: r.created_at,
      reportedWord: {
        wordId: r.word_id,
        term: wordsMap.get(r.word_id)?.term,
      },
      reporter: {
        userId: r.reporter_id,
        displayName: reportersMap.get(r.reporter_id)?.display_name,
      },
    }));

    return { data: finalReports, error: null, count };
  }

  async findReportById(reportId) {
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    if (error) return { error };
    if (!report) return { data: null };

    // Fetch related entities in parallel
    const [wordResult, reporterResult] = await Promise.all([
      supabase
        .from('vocabulary')
        .select('*, creator:users(id, display_name)')
        .eq('id', report.word_id)
        .single(),
      supabase
        .from('users')
        .select('id, display_name, email')
        .eq('id', report.reporter_id)
        .single(),
    ]);

    if (wordResult.error) return { error: wordResult.error };
    if (reporterResult.error) return { error: reporterResult.error };

    const finalReport = {
      reportId: report.id,
      status: report.status,
      reportedAt: report.created_at,
      reason: report.reason,
      reportedWord: {
        wordId: wordResult.data.id,
        term: wordResult.data.term,
        definition: wordResult.data.definition,
      },
      reporter: {
        userId: reporterResult.data.id,
        displayName: reporterResult.data.display_name,
        email: reporterResult.data.email,
      },
      wordCreator: {
        userId: wordResult.data.creator.id,
        displayName: wordResult.data.creator.display_name,
      },
    };

    return { data: finalReport, error: null };
  }

  async updateReportStatus(reportId, status, adminId, notes) {
    return await supabase
      .from('reports')
      .update({
        status: status, // Always set to resolved
        resolver_id: adminId,
        resolution_notes: notes,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single();
  }
}

module.exports = new AdminModel();
