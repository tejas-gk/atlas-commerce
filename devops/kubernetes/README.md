# Kubernetes

The manifests in `base/` are a plain-Kubernetes starting point for Atlas Commerce.

## Included

- namespace and shared config
- example secret manifest
- stateful infra for PostgreSQL and Redis
- single-broker Kafka with Zookeeper for development and test clusters
- app deployments and services for the current Dockerized apps
- ingress routes for the main web properties and API gateway

## Render

```bash
kubectl kustomize devops/kubernetes/base
```

## Apply

```bash
kubectl apply -k devops/kubernetes/base
```

## Important

- Replace `docker.io/replace-me/...` image references before applying.
- Copy `atlas-secrets.example.yaml` to a private file and fill in real values.
- Move PostgreSQL and Kafka to managed offerings before production if you want better durability and simpler operations.
