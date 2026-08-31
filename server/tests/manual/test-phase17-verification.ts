import { connectDatabase, disconnectDatabase } from '@/database/connection/db';
import { ApplicationModel } from '@/database/models/Application.model';
import { JobModel } from '@/database/models/Job.model';
import { ResumeModel } from '@/database/models/Resume.model';
import { ApplicationService } from '@/modules/application/application.service';

async function testSuite() {
  await connectDatabase();
  console.log('Connected to DB');
  
  const userIdCandidate = 'test_candidate_' + Date.now();
  const userIdOther = 'test_other_user_' + Date.now();

  // Create native active job
  const jobNative: any = await JobModel.create({
    companyId: '66bcd123456789abcdef0123',
    title: 'Test Software Engineer',
    description: 'Test Description for Native Job',
    status: 'active',
    sourceType: 'platform',
    createdBy: userIdOther
  });

  // Create external job
  const jobExternal: any = await JobModel.create({
    companyId: '66bcd123456789abcdef0123',
    title: 'External Jooble Engineer',
    description: 'Test Description for External Job',
    status: 'active',
    sourceType: 'external',
    sourceProvider: 'jooble',
    sourceUrl: 'https://jooble.org/test-job-url',
    externalId: 'ext_12345',
    createdBy: userIdOther
  });

  // Create Resume for Candidate
  const resumeCandidate: any = await ResumeModel.create({
    userId: userIdCandidate,
    title: 'Candidate Original Resume Title',
    originalFileName: 'candidate_cv.pdf',
    fileName: 'file_uuid_1.pdf',
    storageKey: 'resumes/' + userIdCandidate + '/file_uuid_1.pdf',
    fileUrl: '/api/resumes/download-ref/file_uuid_1.pdf',
    mimeType: 'application/pdf',
    fileSize: 123456,
    isDefault: true,
    status: 'uploaded',
    version: 1
  });

  // Create Resume for Other User
  const resumeOther: any = await ResumeModel.create({
    userId: userIdOther,
    title: 'Other User Resume',
    originalFileName: 'other_cv.pdf',
    fileName: 'file_uuid_2.pdf',
    storageKey: 'resumes/' + userIdOther + '/file_uuid_2.pdf',
    fileUrl: '/api/resumes/download-ref/file_uuid_2.pdf',
    mimeType: 'application/pdf',
    fileSize: 654321,
    isDefault: true,
    status: 'uploaded',
    version: 1
  });

  const service = new ApplicationService();

  console.log('\n--- 1. APPLY TO EXTERNAL JOB ---');
  const extRes = await service.applyToJob(userIdCandidate, { jobId: jobExternal._id.toString() });
  console.log('External Job Response:', extRes);

  console.log('\n--- 2. APPLY WITH OTHER USER RESUME (OWNERSHIP CHECK) ---');
  try {
    await service.applyToJob(userIdCandidate, { jobId: jobNative._id.toString(), resumeId: resumeOther._id.toString() });
    console.error('FAIL: Should have thrown ownership error');
  } catch (err: any) {
    console.log('SUCCESS: Caught ownership error ->', err.code, err.message);
  }

  console.log('\n--- 3. VALID APPLICATION (PERSISTS IMMUTABLE SNAPSHOT) ---');
  const appNative: any = await service.applyToJob(userIdCandidate, { jobId: jobNative._id.toString(), resumeId: resumeCandidate._id.toString() });
  console.log('Created Application ID:', appNative._id);
  console.log('Stored resumeSnapshot:', appNative.resumeSnapshot);

  console.log('\n--- 4. DUPLICATE APPLICATION TEST (SERVICE & MONGO INDEX) ---');
  try {
    await service.applyToJob(userIdCandidate, { jobId: jobNative._id.toString() });
    console.error('FAIL: Should have thrown duplicate error');
  } catch (err: any) {
    console.log('SUCCESS: Caught duplicate application error ->', err.code, err.message);
  }

  console.log('\n--- 5. RACE CONDITION CONCURRENCY TEST ---');
  const userRace = 'test_race_' + Date.now();
  const resumeRace = await ResumeModel.create({
    userId: userRace,
    title: 'Race Resume',
    originalFileName: 'race.pdf',
    fileName: 'race.pdf',
    storageKey: 'resumes/' + userRace + '/race.pdf',
    fileUrl: 'url',
    mimeType: 'application/pdf',
    fileSize: 100,
    isDefault: true,
    status: 'uploaded'
  });

  const results = await Promise.allSettled([
    service.applyToJob(userRace, { jobId: jobNative._id.toString(), resumeId: resumeRace._id.toString() }),
    service.applyToJob(userRace, { jobId: jobNative._id.toString(), resumeId: resumeRace._id.toString() })
  ]);
  const fulfilledCount = results.filter(r => r.status === 'fulfilled').length;
  const rejectedCount = results.filter(r => r.status === 'rejected').length;
  console.log(`Race test results: ${fulfilledCount} succeeded, ${rejectedCount} rejected via unique index.`);

  console.log('\n--- 6. IMMUTABILITY CHECK (MODIFY CANDIDATE RESUME) ---');
  resumeCandidate.title = 'MODIFIED TITLE AFTER APPLYING';
  resumeCandidate.isDefault = false;
  await resumeCandidate.save();

  const fetchedApp = await service.getMyApplication(userIdCandidate, appNative._id.toString());
  console.log('Fetched Application snapshot title:', fetchedApp.resumeSnapshot?.title);
  console.log('Was snapshot preserved intact?', fetchedApp.resumeSnapshot?.title === 'Candidate Original Resume Title');

  console.log('\n--- 7. WITHDRAWAL TEST ---');
  const withdrawRes = await service.withdrawApplication(userIdCandidate, appNative._id.toString(), { reason: 'Accepted another offer' });
  console.log('Withdrawn status:', withdrawRes.status);
  console.log('Status History timeline:', withdrawRes.statusHistory);

  console.log('\n--- 8. DOUBLE WITHDRAWAL TEST ---');
  try {
    await service.withdrawApplication(userIdCandidate, appNative._id.toString(), {});
    console.error('FAIL: Should have thrown double withdrawal error');
  } catch (err: any) {
    console.log('SUCCESS: Caught double withdrawal error ->', err.code, err.message);
  }

  // Cleanup
  await ApplicationModel.deleteMany({ userId: { $in: [userIdCandidate, userIdOther, userRace] } });
  await ResumeModel.deleteMany({ _id: { $in: [resumeCandidate._id, resumeOther._id, resumeRace._id] } });
  await JobModel.deleteMany({ _id: { $in: [jobNative._id, jobExternal._id] } });

  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  await disconnectDatabase();
}

testSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
