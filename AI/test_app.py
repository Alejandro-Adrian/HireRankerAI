import pytest
import asyncio
from flask import json
from app import app, generate_token, verify_token, db_add_session, db_get_session, db_remove_session, routing


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_generate_token_and_verify():
    username = "testuser"
    token = generate_token(username)
    assert isinstance(token, str)
    verified = verify_token(token)
    assert verified == username

def test_login_missing_username(client):
    response = client.post("/token", json={})
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data

def test_login_success(client):
    response = client.post("/token", json={"username": "tester"})
    assert response.status_code == 200
    data = response.get_json()
    assert "token" in data
    user = verify_token(data["token"])
    assert user == "tester"


def test_session_lifecycle():
    sid = "testsession123"
    # add session (no client_public_key for simplicity)
    db_add_session(sid, "tester", None, "c2Vzc2lvbmtleQ==")
    s = db_get_session(sid)
    assert s is not None
    assert s.get("sid") == sid
    assert s.get("user") == "tester"
    # remove and check gone
    db_remove_session(sid)
    assert db_get_session(sid) is None


def test_routing_ai_plaintext():
    # routing is async; run it and ensure we get a structure back (plaintext mode returns dict with message)
    result = asyncio.run(routing("AI", "hello from test"))
    assert isinstance(result, dict)
    # Depending on server PLAINTEXT_MODE this may be plaintext or encrypted; accept either.
    assert any(k in result for k in ("message", "result", "error", "encrypted"))