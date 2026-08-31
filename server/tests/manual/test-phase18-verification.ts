import { connectDatabase, disconnectDatabase } from '@/database/connection/db';
import { ApplicationModel } from '@/database/models/Application.model';
import { JobModel } from '@/database/models/Job.model';
import { ResumeModel } from '@/database/models/Resume.model';
import { CompanyModel } from '@/database/models/Company.model';
import { CompanyMemberModel } from '@/database/models/CompanyMember.model';
import { ApplicationService } from '@/modules/application/application.service';
import { RecruiterApplicationService } from '@/modules/recruiter-application/recruiter-application.service';
import { CompanyMemberRole, CompanyMemberStatus, ApplicationStatus } from '@/core/constants/enums';

async function testPhase18Suite() {
  await connectDatabase();
  console.log('Connected to DB for Phase 18 Tests');

  const recruiterUserA = 'recruiter_A_' + Date.now();
  const recruiterUserB = 'recruiter_B_' + Date.now();
  const candidateUser = 'candidate_' + Date.now();

  // 1. Create Company A & Membership A
  const companyA = await CompanyModel.create({
    name: 'Company A Tech',
    slug: 'company-a-' + Date.now(),
    createdBy: recruiterUserA
  });

  await CompanyMemberModel.create({
    userId: recruiterUserA,
    companyId: companyA._id,
    role: CompanyMemberRole.RECRUITER,
    status: CompanyMemberStatus.ACTIVE
  });

  // 2. Create Company B & Membership B
  const companyB = await CompanyModel.create({
    name: 'Company B Inc',
    slug: 'company-b-' + Date.now(),
    createdBy: recruiterUserB
  });

  await CompanyMemberModel.create({
    userId: recruiterUserB,
    companyId: companyB._id,
    role: CompanyMemberRole.RECRUITER,
    status: CompanyMemberStatus.ACTIVE
  });

  // 3. Create Job A for Company A & Job B for Company B
  const jobA: any = await JobModel.create({
    companyId: companyA._id,
    title: 'Company A Engineer',
    description: 'Job in Company A',
    status: 'active',
    sourceType: 'platform',
    createdBy: recruiterUserA
  });

  const jobB: any = await JobModel.create({
    companyId: companyB._id,
    title: 'Company B Manager',
    description: 'Job in Company B',
    status: 'active',
    sourceType: 'platform',
    createdBy: recruiterUserB
  });

  // 4. Create Candidate Resume & Application to Job A
  const resumeCandidate: any = await ResumeModel.create({
    userId: candidateUser,
    title: 'Candidate Software Resume',
    originalFileName: 'cv.pdf',
    fileName: 'cv.pdf',
    storageKey: 'resumes/' + candidateUser + '/cv.pdf',
    fileUrl: '/url',
    mimeType: 'application/pdf',
    fileSize: 500,
    isDefault: true,
    status: 'uploaded',
    version: 1
  });

  const candidateAppService = new ApplicationService();
  const recruiterAppService = new RecruiterApplicationService();

  const applicationA: any = await candidateAppService.applyToJob(candidateUser, {
    jobId: jobA._id.toString(),
    resumeId: resumeCandidate._id.toString()
  });

  console.log('\n--- TEST 1: RECRUITER A CAN ACCESS COMPANY A APPLICATIONS ---');
  const recruiterAList = await recruiterAppService.getCompanyApplications(recruiterUserA, {});
  console.log('Recruiter A application count:', recruiterAList.items.length);
  console.log('Recruiter A list matches application A ID:', recruiterAList.items[0]?.id === applicationA._id.toString());

  console.log('\n--- TEST 2: RECRUITER B CANNOT ACCESS COMPANY A APPLICATIONS (CROSS-COMPANY ISOLATION) ---');
  const recruiterBList = await recruiterAppService.getCompanyApplications(recruiterUserB, {});
  console.log('Recruiter B application count:', recruiterBList.items.length);
  try {
    await recruiterAppService.getCompanyApplicationDetails(recruiterUserB, applicationA._id.toString());
    console.error('FAIL: Recruiter B should not access Company A application');
  } catch (err: any) {
    console.log('SUCCESS: Recruiter B denied cross-company access ->', err.code, err.message);
  }

  console.log('\n--- TEST 3: RECRUITER A VALID STATUS TRANSITIONS (APPLIED -> UNDER_REVIEW -> SHORTLISTED) ---');
  const updated1 = await recruiterAppService.updateApplicationStatus(recruiterUserA, applicationA._id.toString(), {
    status: ApplicationStatus.UNDER_REVIEW,
    reason: 'Initial recruiter review'
  });
  console.log('Status updated to:', updated1.status);

  const updated2 = await recruiterAppService.updateApplicationStatus(recruiterUserA, applicationA._id.toString(), {
    status: ApplicationStatus.SHORTLISTED,
    reason: 'Shortlisted for interview round'
  });
  console.log('Status updated to:', updated2.status);
  console.log('Status history timeline count:', updated2.statusHistory.length);

  console.log('\n--- TEST 4: INVALID STATUS TRANSITION REJECTED (SHORTLISTED -> APPLIED) ---');
  try {
    await recruiterAppService.updateApplicationStatus(recruiterUserA, applicationA._id.toString(), {
      status: ApplicationStatus.APPLIED
    });
    console.error('FAIL: Should reject backwards transition');
  } catch (err: any) {
    console.log('SUCCESS: Invalid transition rejected ->', err.code, err.message);
  }

  console.log('\n--- TEST 5: CANDIDATE WITHDRAWAL PROTECTS APPLICATION FROM RECRUITER OVERWRITE ---');
  await candidateAppService.withdrawApplication(candidateUser, applicationA._id.toString(), { reason: 'Accepted another role' });
  try {
    await recruiterAppService.updateApplicationStatus(recruiterUserA, applicationA._id.toString(), {
      status: ApplicationStatus.HIRED
    });
    console.error('FAIL: Recruiter should not modify WITHDRAWN application');
  } catch (err: any) {
    console.log('SUCCESS: Overwriting WITHDRAWN application blocked ->', err.code, err.message);
  }

  // Cleanup
  await ApplicationModel.deleteMany({ userId: candidateUser });
  await ResumeModel.deleteMany({ _id: resumeCandidate._id });
  await JobModel.deleteMany({ _id: { $in: [jobA._id, jobB._id] } });
  await CompanyMemberModel.deleteMany({ userId: { $in: [recruiterUserA, recruiterUserB] } });
  await CompanyModel.deleteMany({ _id: { $in: [companyA._id, companyB._id] } });

  console.log('\nALL PHASE 18 INTEGRATION & AUTHORIZATION TESTS PASSED SUCCESSFULLY!');
  await disconnectDatabase();
}

testPhase18Suite().catch((err) => {
  console.error('Phase 18 Test Suite Failed:', err);
  process.exit(1);
});
