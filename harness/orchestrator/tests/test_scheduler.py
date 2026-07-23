import os
import sys
import tempfile
import unittest
from unittest import mock

ORCHESTRATOR_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ORCHESTRATOR_DIR)

import scheduler


def task(task_id, epic_id, status="todo", files=None):
    return {
        "id": task_id,
        "_epic": epic_id,
        "_path": f"workspace/epics/{epic_id}/tasks/{task_id}.md",
        "status": status,
        "depends_on": [],
        "priority": {"moscow": "must"},
        "files": files or {"create": [], "update": []},
    }


class SchedulerActiveEpicTests(unittest.TestCase):
    def test_ready_returns_only_tasks_from_active_epic(self):
        epics = {"E00": {"wsjf": 1}, "E01": {"wsjf": 100}}
        tasks = {
            "E00-T01": task("E00-T01", "E00"),
            "E01-T01": task("E01-T01", "E01"),
        }

        picks, in_flight = scheduler.ready(
            epics, tasks, children={}, active_epic="E00"
        )

        self.assertEqual(["E00-T01"], picks)
        self.assertEqual(0, in_flight)

    def test_in_flight_count_remains_global_while_picks_are_scoped(self):
        epics = {"E00": {"wsjf": 1}, "E01": {"wsjf": 1}}
        tasks = {
            "E00-T01": task("E00-T01", "E00"),
            "E01-T01": task("E01-T01", "E01", status="in-progress"),
        }

        picks, in_flight = scheduler.ready(
            epics, tasks, children={}, active_epic="E00"
        )

        self.assertEqual(["E00-T01"], picks)
        self.assertEqual(1, in_flight)

    def test_load_active_epic_reads_configured_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = os.path.join(tmp, "state.yaml")
            with open(state_path, "w", encoding="utf-8") as state_file:
                state_file.write("current_epic: E07\n")

            with mock.patch.object(scheduler, "abspath", return_value=state_path):
                self.assertEqual("E07", scheduler.load_active_epic())


class SchedulerWipTests(unittest.TestCase):
    def test_limit_is_bounded_by_available_slots(self):
        self.assertEqual(2, scheduler.dispatch_count(10, slots=2, limit=5))

    def test_zero_slots_returns_no_work(self):
        self.assertEqual(0, scheduler.dispatch_count(10, slots=0, limit=5))

    def test_default_limit_uses_available_slots(self):
        self.assertEqual(3, scheduler.dispatch_count(10, slots=3))


if __name__ == "__main__":
    unittest.main()
