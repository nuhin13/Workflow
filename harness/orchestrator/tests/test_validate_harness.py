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


if __name__ == "__main__":
    unittest.main()
