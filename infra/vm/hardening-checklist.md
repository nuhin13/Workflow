# VM hardening checklist

Supplier-neutral. Nothing here has been applied — no VM exists yet. This is the
list an operator works through when one is provisioned, and each item states why
it matters so it is not cargo-culted.

## Access

- [ ] SSH key authentication only; password authentication disabled.
- [ ] Root SSH login disabled. Administration goes through a named account, so
      an audit log can attribute an action to a person.
- [ ] A named non-root account per operator, never a shared login.
- [ ] SSH exposed only to known source addresses, or behind the supplier's
      bastion/VPN.
- [ ] Key inventory recorded off-host, so access can be revoked when someone
      leaves without hunting through the machine.

## Network

- [ ] Default-deny inbound. Open only 443 publicly and SSH per the rule above.
- [ ] PostgreSQL (5432) and object storage are NEVER exposed publicly. They are
      managed services reached outbound.
- [ ] Container ports bound to loopback and fronted by the reverse proxy; a
      container must not publish straight to a public interface.
- [ ] Outbound egress documented, so an unexpected connection is noticeable.

## Host

- [ ] Automatic security updates enabled for the base OS.
- [ ] Docker engine kept current; the daemon socket never exposed over TCP.
- [ ] Time synchronised — correlating logs across hosts depends on it.
- [ ] Host disk encrypted at rest where the supplier offers it.
- [ ] Swap sized so an OOM kills one container rather than wedging the host.

## Containers

- [x] Every application container runs as a non-root user. *(Enforced by the
      Dockerfiles and asserted by `scripts/verify-compose.sh`.)*
- [x] `no-new-privileges` set on every production service.
- [x] Read-only root filesystem with an explicit `tmpfs` for scratch.
- [x] Health checks defined for all three services.
- [x] Resource limits present (values are placeholders — open item 12).
- [ ] Images pinned by digest — BLOCKED on open items 4 and 11.

## Secrets

- [ ] `DATABASE_URL` injected from the secret manager, never a file on the host
      and never a shell history entry — BLOCKED on open item 6.
- [x] No credential, endpoint or production value is committed. *(Asserted by
      `scripts/scan-secrets.sh` in CI.)*
- [ ] Rotation procedure and owner named for every credential.

## Verification

- [ ] Run through `deploy-runbook.md` on a non-production host first.
- [ ] Run through `rebuild-runbook.md` and record how long it actually took —
      that number is the real RTO, whatever the target says.
- [ ] Confirm logs reach the off-host destination — BLOCKED on open item 10.
