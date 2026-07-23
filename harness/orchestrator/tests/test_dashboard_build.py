import os
import sys
import tempfile
import unittest
from unittest import mock

ORCHESTRATOR_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ORCHESTRATOR_DIR)

import dashboard_build


class QuestionRegisterTests(unittest.TestCase):
    def test_load_questions_reads_open_table_rows(self):
        register = """# Open Questions

| ID | Question | Raised in | Blocks | Options + recommendation | Status | Answer |
|---|---|---|---|---|---|---|
| Q-001 | Which API? | BRD 7 | E01-T02 | A/B - recommend A | open | |
| Q-002 | Old question | PRD 2 | - | A/B | answered | A |
"""
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "open-questions.md")
            with open(path, "w", encoding="utf-8") as register_file:
                register_file.write(register)
            with mock.patch.object(dashboard_build, "abspath", return_value=path):
                questions = dashboard_build.load_questions()

        self.assertEqual(
            [{
                "id": "Q-001",
                "question": "Which API?",
                "blocks": "E01-T02",
                "status": "open",
            }],
            questions,
        )

    def test_blocker_details_come_from_question_register(self):
        questions = [{
            "id": "Q-001",
            "question": "Which API?",
            "blocks": "E01-T02",
            "status": "open",
        }]

        output = dashboard_build.blockers_html({"blockers": ["Q-001"]}, questions)

        self.assertIn("Which API?", output)
        self.assertIn("blocks E01-T02", output)

    def test_missing_register_entry_is_visible(self):
        output = dashboard_build.blockers_html({"blockers": ["Q-099"]}, [])

        self.assertIn("Q-099", output)
        self.assertIn("missing from question register", output)


if __name__ == "__main__":
    unittest.main()
