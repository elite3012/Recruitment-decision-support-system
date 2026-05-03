# Hugging Face Spaces Deployment

Deploy this project as a Hugging Face Docker Space.

## Steps

1. Create a new Space on Hugging Face.
2. Select **Docker** as the Space SDK.
3. Push this repository to the Space repository.
4. Wait for the Docker build to finish.

The app listens on port `7860`, which is the default Hugging Face Spaces web port.

## Default Login

```text
Username: admin
Password: admin123
```

## Runtime Notes

- The container serves both the FastAPI API and the React frontend.
- If `data/app.db` is missing, startup runs `seed.py`.
- `seed.py` loads `data/demo_seed.json`, which contains the demo jobs and candidates.
- Hugging Face free storage is ephemeral, so changes made in the UI may reset after the Space restarts.
