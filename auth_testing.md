# Auth Testing Playbook

## Step 1: MongoDB verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
```
Verify: password_hash starts with $2b$, unique index on users.email, index on login_attempts.identifier and dataset_rows.dataset_id.

## Step 2: API testing
```
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@masterkeyanalysis.in","password":"MasterKey@2026"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s "$API_URL/api/auth/me" -H "Authorization: Bearer $TOKEN"
```
Login returns {token, user}; /auth/me returns the admin user.

## Step 3: Protected routes without token
```
curl -s "$API_URL/api/datasets"   # expect 401
```
