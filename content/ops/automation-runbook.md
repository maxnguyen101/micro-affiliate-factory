# Automation Runbook

## Daily (automated by cron)
- Run `npm run gates`
- If fail: capture failing checks and propose patch set
- If pass: note status in command center logs

## Weekly (automated by cron)
- Review command center docs
- Propose next cluster and one CRO improvement

## Manual publish flow
1. Implement/modify pages
2. Run `npm run gates`
3. Commit and push
4. Verify live routes
5. Log changes in `command_center/logs.md`
