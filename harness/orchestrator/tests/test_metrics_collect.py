import csv
import os
import sys
import tempfile
import unittest

ORCHESTRATOR_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ORCHESTRATOR_DIR)

import metrics_collect


class MetricsSchemaTests(unittest.TestCase):
    def test_existing_csv_gets_exit_code_column_without_losing_rows(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "metrics.csv")
            old_header = metrics_collect.HEADER[:-1]
            with open(path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=old_header)
                writer.writeheader()
                writer.writerow({"task_id": "E01-T01", "platform": "codex"})

            fields = metrics_collect.ensure_schema(path)
            with open(path, newline="", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))

        self.assertIn("exit_code", fields)
        self.assertEqual("E01-T01", rows[0]["task_id"])
        self.assertEqual("", rows[0]["exit_code"])


if __name__ == "__main__":
    unittest.main()
