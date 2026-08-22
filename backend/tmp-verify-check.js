const fs = require('fs');
const path = require('path');

const base = 'http://localhost:5000';
const tmp = path.join(__dirname, 'tmp-test-payment.png');
fs.writeFileSync(tmp, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAF', 'base64'));

(async () => {
  const form = new FormData();
  form.append('teamName', 'API Test Team');
  form.append('trackId', 'ai-ml');
  form.append('leaderName', 'API Leader');
  form.append('leaderEmail', 'api.leader@example.com');
  form.append('leaderPhone', '+91 98765 43210');
  form.append('members', JSON.stringify([
    { name: 'Member One', email: 'api.member1@example.com', phone: '+91 98765 43211' },
    { name: 'Member Two', email: 'api.member2@example.com', phone: '+91 98765 43212' }
  ]));
  form.append('paymentScreenshot', fs.createReadStream(tmp), { filename: 'trial.png', contentType: 'image/png' });

  const registerRes = await fetch(base + '/api/register', { method: 'POST', body: form });
  const registerJson = await registerRes.json();
  console.log('REGISTER_STATUS', registerRes.status);
  console.log('REGISTER_BODY', JSON.stringify(registerJson));

  const feeRes = await fetch(base + '/api/registration-fee');
  const feeJson = await feeRes.json();
  console.log('FEE_STATUS', feeRes.status);
  console.log('FEE_BODY', JSON.stringify(feeJson));

  const loginRes = await fetch(base + '/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'fhc' })
  });
  const loginJson = await loginRes.json();
  console.log('LOGIN_STATUS', loginRes.status);
  console.log('LOGIN_BODY', JSON.stringify(loginJson));
  const token = loginJson.token;

  const listRes = await fetch(base + '/api/admin/registrations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const listJson = await listRes.json();
  console.log('LIST_STATUS', listRes.status);
  const team = listJson.data && listJson.data.find(r => r.teamName === 'API Test Team');
  console.log('TEAM_FOUND', !!team);
  if (team) {
    console.log('TEAM_RECORD', JSON.stringify({
      teamId: team.teamId,
      participantCount: team.participantCount,
      feePerParticipantAtRegistration: team.feePerParticipantAtRegistration,
      totalRegistrationFee: team.totalRegistrationFee,
      verificationStatus: team.verificationStatus,
      paymentScreenshot: !!team.paymentScreenshot,
      rejectionReason: team.rejectionReason
    }, null, 2));

    const verifyRes = await fetch(base + `/api/admin/registrations/${team._id}/verification`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'Verified', paymentAmountChecked: team.totalRegistrationFee })
    });
    const verifyJson = await verifyRes.json();
    console.log('VERIFY_STATUS', verifyRes.status);
    console.log('VERIFY_BODY', JSON.stringify(verifyJson));

    const rejectRes = await fetch(base + `/api/admin/registrations/${team._id}/verification`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'Rejected', rejectionReason: 'Amount mismatch' })
    });
    const rejectJson = await rejectRes.json();
    console.log('REJECT_STATUS', rejectRes.status);
    console.log('REJECT_BODY', JSON.stringify(rejectJson));

    const screenshotRes = await fetch(base + `/api/admin/registrations/${team._id}/payment-screenshot`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('SCREENSHOT_STATUS', screenshotRes.status, 'CONTENT_TYPE', screenshotRes.headers.get('content-type'));

    const emailRes = await fetch(base + `/api/admin/registrations/${team._id}/send-rejection-email`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const emailJson = await emailRes.json();
    console.log('EMAIL_STATUS', emailRes.status);
    console.log('EMAIL_BODY', JSON.stringify(emailJson));
  }

  fs.unlinkSync(tmp);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
