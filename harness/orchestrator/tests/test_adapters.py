import csv
import json
import os
import shutil
import subprocess
import tempfile
import textwrap
import unittest

ROOT = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


class AdapterFailureAuditTests(unittest.TestCase):
    def test_codex_failure_still_stamps_metrics_and_returns_cli_status(self):
        with tempfile.TemporaryDirectory() as tmp:
            for rel in (
                "harness/adapters/run-codex.sh",
                "harness/orchestrator/paths.py",
                "harness/orchestrator/dispatch_policy.py",
                "harness/orchestrator/metrics_collect.py",
                "harness/agents/developer-backend.md",
                "harness/mcp/servers.json",
            ):
                source = os.path.join(ROOT, rel)
                target = os.path.join(tmp, rel)
                os.makedirs(os.path.dirname(target), exist_ok=True)
                shutil.copy2(source, target)

            with open(os.path.join(tmp, "harness.yaml"), "w", encoding="utf-8") as f:
                f.write(textwrap.dedent(
                    """
                    model_tiers:
                      build:
                        codex: test-model
                    paths:
                      epics: workspace/epics/
                      runs: workspace/runs/
                    """
                ))

            epic_dir = os.path.join(tmp, "workspace", "epics", "E99-fixture")
            task_dir = os.path.join(epic_dir, "tasks")
            os.makedirs(task_dir)
            with open(os.path.join(epic_dir, "epic.md"), "w", encoding="utf-8") as f:
                f.write("---\nid: E99\n---\n")
            with open(
                os.path.join(task_dir, "E99-T01-fixture.md"), "w", encoding="utf-8"
            ) as f:
                f.write(textwrap.dedent(
                    """
                    ---
                    id: E99-T01
                    owner_agent: developer-backend
                    tier: build
                    ---
                    """
                ))

            fake_cli = os.path.join(tmp, "fake-codex")
            with open(fake_cli, "w", encoding="utf-8") as f:
                f.write("#!/usr/bin/env bash\nprintf '{\"type\":\"result\"}\\n'\nexit 7\n")
            os.chmod(fake_cli, 0o755)

            env = os.environ.copy()
            env["HARNESS_CODEX_BIN"] = fake_cli
            result = subprocess.run(
                [
                    "bash",
                    os.path.join(tmp, "harness", "adapters", "run-codex.sh"),
                    "E99-T01",
                    "fixture prompt",
                ],
                cwd=tmp,
                env=env,
                text=True,
                capture_output=True,
                check=False,
            )

            metrics_path = os.path.join(epic_dir, "metrics.csv")
            with open(metrics_path, newline="", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
            policy_files = [
                path for path in os.listdir(
                    os.path.join(tmp, "workspace", "runs", "E99-T01")
                )
                if path.endswith("-policy.json")
            ]
            with open(
                os.path.join(
                    tmp, "workspace", "runs", "E99-T01", policy_files[0]
                ),
                encoding="utf-8",
            ) as f:
                policy = json.load(f)

        self.assertEqual(7, result.returncode)
        self.assertEqual("7", rows[0]["exit_code"])
        self.assertEqual("test-model", rows[0]["model"])
        self.assertEqual("test-model", policy["model"])


if __name__ == "__main__":
    unittest.main()
