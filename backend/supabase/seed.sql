-- Seed users
INSERT INTO public.users (id, email, role, account_status, email_verified, created_at, updated_at)
VALUES 
  ('16ba97c6-15f3-4515-88af-fd74285d47ae', 'teacher@vocaboost.com', 'teacher', 'active', TRUE, '2025-07-15T09:13:58.580387', '2025-07-15T09:13:58.580387'),
  ('9e4da817-8fb9-422c-9cfe-122752a3ff5d', 'learner1@vb.com', 'learner', 'active', TRUE, '2025-07-15T09:13:58.580387', '2025-07-15T09:13:58.580387'),
  ('e4a1362e-eeac-43bc-87ff-f4121ed11dab', 'learner2@vb.com', 'learner', 'active', TRUE, '2025-07-15T09:13:58.580387', '2025-07-15T09:13:58.580387'),
  ('653d9fb9-54db-415a-91e2-f3aa549f1eba', 'learner3@vb.com', 'learner', 'active', TRUE, '2025-07-15T09:13:58.580387', '2025-07-15T09:13:58.580387'),
  ('e3d2f7a8-4c92-4e3e-87f4-bd3a7cd62db9', 'bin01677952356@gmail.com', 'learner', 'active', TRUE, '2025-07-15T09:13:58.580387', '2025-07-15T09:13:58.580387');

-- Seed classroom
INSERT INTO public.classrooms (
  id, teacher_id, name, description, join_code, learner_count, assignment_count, classroom_status, is_auto_approval_enabled, capacity_limit, created_at, updated_at
)
VALUES (
  '0942ed47-0982-4916-b7bd-ad5735bd60a3', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'TOEIC Test', 'Class for TOEIC practice', 'ABC123', 0, 0, 'public', TRUE, 30, '2025-07-15T09:13:58.580387', '2025-07-15T09:13:58.580387'
);

-- Seed classroom members
INSERT INTO public.classroom_members (classroom_id, learner_id, email, join_status, joined_at)
VALUES 
  ('0942ed47-0982-4916-b7bd-ad5735bd60a3', '9e4da817-8fb9-422c-9cfe-122752a3ff5d', 'learner1@vb.com', 'joined', '2025-07-15T09:13:58.580387'),
  ('0942ed47-0982-4916-b7bd-ad5735bd60a3', 'e4a1362e-eeac-43bc-87ff-f4121ed11dab', 'learner2@vb.com', 'pending_request', NULL),
  ('0942ed47-0982-4916-b7bd-ad5735bd60a3', '653d9fb9-54db-415a-91e2-f3aa549f1eba', 'learner3@vb.com', 'rejected', NULL);

-- Seed vocab list
INSERT INTO public.vocab_lists (
  id, creator_id, title, description, word_count, privacy_setting, is_active, created_at, updated_at
)
VALUES (
  '3ecb287e-453a-4c97-a590-e85742d0b9d2',
  '16ba97c6-15f3-4515-88af-fd74285d47ae',
  'Basic TOEIC Vocabulary',
  'Common words for TOEIC beginner level',
  10,
  'private',
  TRUE,
  '2025-07-15T09:20:00.000000',
  '2025-07-15T09:20:00.000000'
);

-- Seed vocabulary
INSERT INTO public.vocabulary (
  id, list_id, created_by, term, definition, phonetics, created_at, updated_at
)
VALUES 
  ('00111111-0000-0000-0000-000000000001', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'invoice', 'a document asking for payment', '/ˈɪnvɔɪs/', now(), now()),
  ('00111111-0000-0000-0000-000000000002', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'shipment', 'an amount of goods sent together', '/ˈʃɪpmənt/', now(), now()),
  ('00111111-0000-0000-0000-000000000003', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'customer', 'a person who buys goods or services', '/ˈkʌstəmər/', now(), now()),
  ('00111111-0000-0000-0000-000000000004', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'contract', 'a written agreement', '/ˈkɒntrækt/', now(), now()),
  ('00111111-0000-0000-0000-000000000005', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'employee', 'a person who works for someone else', '/ɪmˈplɔɪiː/', now(), now()),
  ('00111111-0000-0000-0000-000000000006', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'manager', 'a person in charge of a business or department', '/ˈmænɪdʒər/', now(), now()),
  ('00111111-0000-0000-0000-000000000007', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'deadline', 'a time by which something must be done', '/ˈdedlaɪn/', now(), now()),
  ('00111111-0000-0000-0000-000000000008', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'budget', 'a plan for spending money', '/ˈbʌdʒɪt/', now(), now()),
  ('00111111-0000-0000-0000-000000000009', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'meeting', 'an event where people come together to discuss', '/ˈmiːtɪŋ/', now(), now()),
  ('00111111-0000-0000-0000-000000000010', '3ecb287e-453a-4c97-a590-e85742d0b9d2', '16ba97c6-15f3-4515-88af-fd74285d47ae', 'salary', 'money paid for work', '/ˈsæləri/', now(), now());

