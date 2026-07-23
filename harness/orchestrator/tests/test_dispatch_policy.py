import json
import os
import sys
import tempfile
import unittest
from unittest import mock

ORCHESTRATOR_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ORCHESTRATOR_DIR)

import dispatch_policy


class ModelRoutingTests(unittest.TestCase):
    def test_resolves_tier_for_explicit_platform(self):
        cfg = {"model_tiers": {"build": {"codex": "codex-model"}}}
        self.assertEqual(
            "codex-model", dispatch_policy.resolve_model(cfg, "build", "codex")
        )

    def test_unset_mapping_stops_instead_of_falling_back(self):
        cfg = {"model_tiers": {"deep": {"opencode": None}}}
        with self.assertRaisesRegex(RuntimeError, "refusing silent fallback"):
            dispatch_policy.resolve_model(cfg, "deep", "opencode")

    def test_pipeline_role_resolves_its_own_tier_and_allowlist(self):
        policy, _ = dispatch_policy.build_policy(
            None, "codex", role_override="architect"
        )
        self.assertIsNone(policy["task"])
        self.assertEqual("deep", policy["tier"])
        self.assertIn("context7", policy["mcp_allowlist"])

    def build_task_policy(self, task):
        role = {"tier": "build", "mcp": []}
        cfg = {"model_tiers": {"build": {"codex": "codex-model"}}}
        with mock.patch.object(dispatch_policy, "task_file", return_value="/tmp/task.md"), \
                mock.patch.object(
                    dispatch_policy,
                    "frontmatter",
                    side_effect=[task, role],
                ), \
                mock.patch.object(dispatch_policy, "role_file", return_value="/tmp/role.md"), \
                mock.patch.object(dispatch_policy, "load_config", return_value=cfg), \
                mock.patch.object(dispatch_policy, "load_registry", return_value={}):
            return dispatch_policy.build_policy("E01-T01", "codex")

    def test_task_dispatch_requires_its_own_tier(self):
        with self.assertRaisesRegex(RuntimeError, "task tier '<missing>' is invalid"):
            self.build_task_policy({"owner_agent": "developer-backend"})

    def test_task_dispatch_rejects_mistyped_tier(self):
        with self.assertRaisesRegex(RuntimeError, "task tier 'buidl' is invalid"):
            self.build_task_policy({
                "owner_agent": "developer-backend",
                "tier": "buidl",
            })


class McpConfigTests(unittest.TestCase):
    def setUp(self):
        self.registry = {
            "github": {"type": "http", "url": "https://example.test/mcp"},
            "database": {
                "command": "db-mcp",
                "args": ["--readonly"],
                "env": {"TOKEN": "${TOKEN}"},
            },
        }

    def test_claude_config_contains_only_allowed_servers(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "claude.json")
            dispatch_policy.write_mcp_config(
                "claude-code", ["github"], self.registry, path
            )
            with open(path, encoding="utf-8") as config_file:
                servers = json.load(config_file)["mcpServers"]
        self.assertEqual(["github"], list(servers))

    def test_opencode_explicitly_disables_unallowed_servers(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "opencode.json")
            dispatch_policy.write_mcp_config(
                "opencode", ["github"], self.registry, path
            )
            with open(path, encoding="utf-8") as config_file:
                servers = json.load(config_file)["mcp"]
        self.assertTrue(servers["github"]["enabled"])
        self.assertFalse(servers["database"]["enabled"])
        self.assertEqual("{env:TOKEN}", servers["database"]["environment"]["TOKEN"])

    def test_codex_config_contains_only_allowed_overrides(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "codex.args")
            dispatch_policy.write_mcp_config(
                "codex", ["database"], self.registry, path
            )
            with open(path, encoding="utf-8") as config_file:
                content = config_file.read()
        self.assertIn("mcp_servers.database=", content)
        self.assertNotIn("mcp_servers.github=", content)


if __name__ == "__main__":
    unittest.main()
