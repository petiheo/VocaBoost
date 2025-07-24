DROP FUNCTION IF EXISTS update_learner_count_on_members_change();

-- Trigger function to auto-update learner_count
CREATE OR REPLACE FUNCTION update_learner_count_on_members_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.join_status = 'joined' AND OLD.join_status != 'joined' THEN
      UPDATE classrooms SET learner_count = learner_count + 1 WHERE id = NEW.classroom_id;
    ELSIF NEW.join_status != 'joined' AND OLD.join_status = 'joined' THEN
      UPDATE classrooms SET learner_count = learner_count - 1 WHERE id = NEW.classroom_id;
    END IF;

  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.join_status = 'joined' THEN
      UPDATE classrooms SET learner_count = learner_count + 1 WHERE id = NEW.classroom_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.join_status = 'joined' THEN
      UPDATE classrooms SET learner_count = learner_count - 1 WHERE id = OLD.classroom_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_learner_count
AFTER INSERT OR UPDATE OR DELETE ON classroom_members
FOR EACH ROW
EXECUTE FUNCTION update_learner_count_on_members_change();