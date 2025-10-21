import pytest
from flask import json
from app import app, generate_token, verify_token

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