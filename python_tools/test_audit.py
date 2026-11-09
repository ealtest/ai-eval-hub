from python_tools.audit import audit


def test_detects_dynamic_execution():
    result = audit("value = eval(user_input)")
    assert not result["passed"]
    assert any("eval()" in item for item in result["findings"])


def test_detects_subprocess_shell_true():
    result = audit("import subprocess\nsubprocess.run(command, shell=True)")
    assert any("shell=True" in item for item in result["findings"])


def test_detects_pickle_deserialization():
    result = audit("import pickle\npickle.loads(payload)")
    assert any("pickle deserialization" in item for item in result["findings"])


def test_detects_disabled_tls():
    result = audit('import requests\nrequests.get(url, verify=False)')
    assert any("TLS certificate" in item for item in result["findings"])


def test_benign_code_passes():
    result = audit("def add(a: int, b: int) -> int:\n    return a + b")
    assert result["passed"]


def test_syntax_error_is_reported():
    result = audit("def broken(:")
    assert not result["passed"]
    assert any("Syntax error" in item for item in result["findings"])
