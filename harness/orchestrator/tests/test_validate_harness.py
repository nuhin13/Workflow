import os
import sys
import unittest
from unittest import mock

ORCHESTRATOR_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ORCHESTRATOR_DIR)

import validate_harness


def config(phases, gates=None):
    order = [
        "business", "design", "srs", "traceability",
        "tech_plan", "dev_plan", "build",
    ]
    pipeline = {phase: ["driver"] for phase in order}
    pipeline["srs"] = ["srs-authoring"]
    return {
        "phase_order": order,
        "phase_dependencies": {
            "design": ["business"],
            "srs": ["business", "design"],
            "traceability": ["srs"],
            "tech_plan": ["traceability"],
            "dev_plan": ["srs", "tech_plan"],
            "build": ["dev_plan"],
        },
        "pipeline": pipeline,
        "profiles": {
            "test": {
                "phases": phases,
                "human_gates": gates or [],
                "review": "peer_on_all_code",
                "qa": "epic_sweep_plus_high_risk",
            }
        },
    }


class ProfileValidationTests(unittest.TestCase):
    def validate(self, cfg):
        errors, warnings = [], []
        with mock.patch.object(validate_harness, "load_config", return_value=cfg):
            validate_harness.check_pipeline_profiles(errors, warnings)
        return errors

    def test_complete_profile_passes(self):
        phases = [
            "business", "design", "srs", "traceability",
            "tech_plan", "dev_plan", "build",
        ]
        self.assertEqual([], self.validate(config(phases, ["srs_approval"])))

    def test_build_profile_cannot_skip_planning_prerequisites(self):
        errors = self.validate(
            config(["business", "design", "dev_plan", "build"], ["srs_approval"])
        )
        self.assertTrue(any("missing prerequisites" in error for error in errors))

    def test_build_profile_requires_srs_human_gate(self):
        phases = [
            "business", "design", "srs", "traceability",
            "tech_plan", "dev_plan", "build",
        ]
        errors = self.validate(config(phases))
        self.assertTrue(any("without srs_approval" in error for error in errors))

    def test_review_policy_cannot_encode_per_task_qa(self):
        phases = [
            "business", "design", "srs", "traceability",
            "tech_plan", "dev_plan", "build",
        ]
        cfg = config(phases, ["srs_approval"])
        cfg["profiles"]["test"]["review"] = "peer_plus_independent_qa_every_task"

        errors = self.validate(cfg)

        self.assertTrue(any("review controls peer depth" in error for error in errors))

    def test_qa_policy_cannot_require_ordinary_task_qa(self):
        phases = [
            "business", "design", "srs", "traceability",
            "tech_plan", "dev_plan", "build",
        ]
        cfg = config(phases, ["srs_approval"])
        cfg["profiles"]["test"]["qa"] = "every_code_task"

        errors = self.validate(cfg)

        self.assertTrue(any("epic-wide plus high-risk tasks only" in error for error in errors))


class WriteScopeTests(unittest.TestCase):
    def test_qa_scope_expands_tests_but_not_product_source(self):
        cfg = {
            "write_scopes": {
                "shared": ["workspace/state.yaml"],
                "product_code": ["src/", "tests/"],
                "test_code": ["tests/"],
                "qa": ["workspace/epics/", "test_code"],
            }
        }
        with mock.patch.object(validate_harness, "load_config", return_value=cfg):
            roles, shared, groups = validate_harness.load_scopes()

        self.assertIn("tests/", roles["qa"])
        self.assertNotIn("src/", roles["qa"])
        self.assertEqual(["tests/"], groups["test_code"])
        self.assertEqual(["workspace/state.yaml"], shared)

    def test_directory_scope_matches_only_real_descendants(self):
        self.assertTrue(validate_harness.path_allowed("src/module.py", "src/"))
        self.assertFalse(validate_harness.path_allowed("src-old/module.py", "src/"))
        self.assertFalse(
            validate_harness.path_allowed(
                "workspace/plan/00-business-backup/file.md",
                "workspace/plan/00-business/",
            )
        )


class StateSchemaTests(unittest.TestCase):
    def validate(self, contents):
        errors, warnings = [], []
        with mock.patch.object(validate_harness, "abspath", return_value="/tmp/state.yaml"), \
                mock.patch("builtins.open", mock.mock_open(read_data=contents)):
            validate_harness.check_state_schema(errors, warnings)
        return errors

    def test_blockers_are_question_ids(self):
        self.assertEqual([], self.validate("blockers: [Q-001, Q-042]\n"))

    def test_blocker_objects_are_rejected(self):
        errors = self.validate(
            'blockers:\n  - {id: Q-001, blocks: E01-T02, question: "Choose API"}\n'
        )
        self.assertTrue(any("ID-only Q-###" in error for error in errors))

    def test_duplicate_blocker_ids_are_rejected(self):
        errors = self.validate("blockers: [Q-001, Q-001]\n")
        self.assertTrue(any("duplicate blocker ID" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
