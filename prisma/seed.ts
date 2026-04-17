import { PrismaClient } from '@prisma/client'
import { addDays, isWeekend } from 'date-fns'

const prisma = new PrismaClient()

function calcEndDate(startDate: Date, duration: number, includeWeekend: boolean): Date {
  if (includeWeekend) return addDays(startDate, duration - 1)
  let remaining = duration
  let current = new Date(startDate)
  while (remaining > 1) {
    current = addDays(current, 1)
    if (!isWeekend(current)) remaining--
  }
  return current
}

function wd(dateStr: string, days: number, includeWeekend = false, fav = false) {
  const start = new Date(dateStr)
  return { plannedStartDate: start, plannedEndDate: calcEndDate(start, days, includeWeekend), duration: days, includeWeekend, favorite: fav }
}

// 10 projects: 2 not started (green), 4 in progress (blue), 2 overdue (red), 2 completed (black)
async function main() {
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()

  console.log('🌱 Seeding data...\n')

  // ── 1. Not Started A（0%，绿色） ──
  const p1 = await prisma.project.create({
    data: {
      name: 'StoryEAST Brand Website Redesign',
      fullName: 'StoryEAST Brand Official Website Visual Upgrade',
      plannedStartDate: new Date('2026-05-01'),
      duration: 60,
      description: 'Full website upgrade to strengthen brand identity and user conversion',
      owner: 'Michael Chen',
      completionTime: addDays(new Date('2026-05-01'), 59),
      tasks: {
        create: [
          { name: 'Competitor Research & User Interviews', ...wd('2026-05-01', 5), keyPoints: 'Interview 10 existing clients on IA improvements', status: 'TODO' },
          { name: 'Information Architecture & Page Planning', ...wd('2026-05-08', 4), keyPoints: 'Define 5 main sections: Home, Products, Cases, About, Contact', status: 'TODO' },
          { name: 'UI Design (Home + Product Pages)', ...wd('2026-05-14', 8), keyPoints: 'Design style must align with existing VI guidelines', status: 'TODO' },
          { name: 'Frontend Dev: Home & Navigation', ...wd('2026-05-25', 6), keyPoints: 'Mobile responsive; animations under 2s', status: 'TODO' },
          { name: 'Testing & Bug Fixes', ...wd('2026-06-15', 4), keyPoints: 'Test on iPhone 15, Huawei Mate60, iPad', status: 'TODO' },
        ],
      },
    },
  })
  console.log(`✓ Project 1: ${p1.name} (5 tasks, Not Started)`)

  // ── 2. Not Started B（0%，绿色） ──
  const p2 = await prisma.project.create({
    data: {
      name: 'Annual Product Launch Event',
      fullName: '2026 Annual Product Launch Campaign',
      plannedStartDate: new Date('2026-05-15'),
      duration: 45,
      description: 'Full-scale planning and execution for 2026 product launch event',
      owner: 'Emma Wilson',
      completionTime: addDays(new Date('2026-05-15'), 44),
      tasks: {
        create: [
          { name: 'Overall Event Strategy Development', ...wd('2026-05-15', 4), keyPoints: 'Define target audience and communication channels', status: 'TODO' },
          { name: 'Venue Survey & Negotiation', ...wd('2026-05-21', 3), keyPoints: 'Shortlist 3 candidate venues', status: 'TODO' },
          { name: 'Main Visual Design & Materials', ...wd('2026-05-26', 5), keyPoints: 'Reflect brand tone, avoid over-commercialization', status: 'TODO' },
          { name: 'Media Outreach & Invitations', ...wd('2026-06-02', 4), keyPoints: 'Contact 5 tech media outlets', status: 'TODO' },
        ],
      },
    },
  })
  console.log(`✓ Project 2: ${p2.name} (4 tasks, Not Started)`)

  // ── 3. In Progress A（蓝色） ──
  const p3 = await prisma.project.create({
    data: {
      name: 'Oriental Music Festival Campaign',
      fullName: '2026 Oriental Music Festival Marketing Campaign',
      plannedStartDate: new Date('2026-03-20'),
      duration: 45,
      description: 'Multi-channel marketing planning and execution for 2026 music festival',
      owner: 'Sarah Miller',
      completionTime: addDays(new Date('2026-03-20'), 44),
      tasks: {
        create: [
          { name: 'Marketing Strategy Development', ...wd('2026-03-20', 4), keyPoints: 'Target audience 25-40 cultural consumers', status: 'DONE' },
          { name: 'Visual Materials Design (KV)', ...wd('2026-03-25', 5), keyPoints: 'KV must reflect oriental aesthetics', status: 'DONE' },
          { name: 'Xiaohongshu Content Matrix Planning', ...wd('2026-04-01', 4), keyPoints: 'Plan 20 posts including 3 store visits', status: 'IN_PROGRESS', favorite: true },
          { name: 'Weibo Hashtag & KOL Collaboration', ...wd('2026-04-07', 5), keyPoints: 'Contact 3 cultural KOLs within budget', status: 'IN_PROGRESS' },
          { name: 'Pre-sale Ticketing System Launch', ...wd('2026-04-14', 3), keyPoints: 'Integrate with Damo platform; early bird 10% off', status: 'TODO' },
          { name: 'Offline Materials Production & Delivery', ...wd('2026-04-17', 4, true), keyPoints: 'Roll-up banners×20, posters×500', status: 'TODO' },
          { name: 'Live Streaming Coordination', ...wd('2026-04-28', 2), keyPoints: 'Bilibili + Douyin dual-platform broadcast', status: 'TODO' },
        ],
      },
    },
  })
  console.log(`✓ Project 3: ${p3.name} (7 tasks, In Progress)`)

  // ── 4. In Progress B（蓝色） ──
  const p4 = await prisma.project.create({
    data: {
      name: 'Corporate Training System',
      fullName: 'Enterprise Internal Training System Build',
      plannedStartDate: new Date('2026-04-01'),
      duration: 30,
      description: 'Build standardized internal training course system for core teams',
      owner: 'David Brown',
      completionTime: addDays(new Date('2026-04-01'), 29),
      tasks: {
        create: [
          { name: 'Training Needs Assessment', ...wd('2026-04-01', 3), keyPoints: 'Interview 5 department heads on skill gaps', status: 'DONE' },
          { name: 'Course Framework Design', ...wd('2026-04-07', 4), keyPoints: '3 learning paths: general, specialized, management', status: 'IN_PROGRESS' },
          { name: 'First Batch Course Content Development', ...wd('2026-04-13', 5), keyPoints: 'Prioritize PM and creative brief courses', status: 'IN_PROGRESS' },
          { name: 'Instructor Resources Integration', ...wd('2026-04-16', 3), keyPoints: 'Target 3 internal + 2 external instructors', status: 'TODO' },
          { name: 'Learning Platform Configuration', ...wd('2026-04-21', 4), keyPoints: 'WeCom learning platform setup', status: 'TODO' },
          { name: 'Pilot Run & Evaluation', ...wd('2026-04-27', 3), keyPoints: 'First batch 20 learners; 80% satisfaction target', status: 'TODO' },
        ],
      },
    },
  })
  console.log(`✓ Project 4: ${p4.name} (6 tasks, In Progress)`)

  // ── 5. In Progress C（蓝色） ──
  const p5 = await prisma.project.create({
    data: {
      name: 'Mobile APP 2.0 Upgrade',
      fullName: 'Mobile Application Version 2.0 Comprehensive Upgrade',
      plannedStartDate: new Date('2026-03-15'),
      duration: 50,
      description: 'Full app redesign with UX and performance improvements',
      owner: 'James Lee',
      completionTime: addDays(new Date('2026-03-15'), 49),
      tasks: {
        create: [
          { name: 'User Research & Requirements', ...wd('2026-03-15', 5), keyPoints: 'Interview 20 active users', status: 'DONE' },
          { name: 'Interactive Prototype Design', ...wd('2026-03-22', 6), keyPoints: 'Complete core flow prototypes', status: 'DONE' },
          { name: 'UI Visual Design', ...wd('2026-03-30', 8), keyPoints: 'Modern minimalist design style', status: 'IN_PROGRESS' },
          { name: 'Frontend Dev: Home & Navigation', ...wd('2026-04-10', 6), keyPoints: 'Support iOS 16+ and Android 12+', status: 'IN_PROGRESS' },
          { name: 'Backend API Refactoring', ...wd('2026-04-18', 8), keyPoints: 'Optimize response time to under 200ms', status: 'TODO' },
          { name: 'Performance Optimization & Battery Test', ...wd('2026-04-28', 4), keyPoints: 'Reduce memory usage by 30%', status: 'TODO' },
          { name: 'App Store Submission & Review', ...wd('2026-05-05', 3), keyPoints: 'Submit to App Store and Android markets', status: 'TODO' },
        ],
      },
    },
  })
  console.log(`✓ Project 5: ${p5.name} (7 tasks, In Progress)`)

  // ── 6. In Progress D（蓝色） ──
  const p6 = await prisma.project.create({
    data: {
      name: 'Customer Data Platform',
      fullName: 'Unified Customer Data Platform Construction',
      plannedStartDate: new Date('2026-04-05'),
      duration: 40,
      description: 'Integrate business systems to build unified customer data platform',
      owner: 'Lisa Anderson',
      completionTime: addDays(new Date('2026-04-05'), 39),
      tasks: {
        create: [
          { name: 'Data Source Audit & Integration Plan', ...wd('2026-04-05', 5), keyPoints: 'Map 8 heterogeneous system data', status: 'DONE' },
          { name: 'Data Warehouse Modeling Design', ...wd('2026-04-12', 6), keyPoints: 'Star schema design', status: 'IN_PROGRESS' },
          { name: 'ETL Pipeline Development', ...wd('2026-04-20', 8), keyPoints: 'Handle 5M records daily', status: 'IN_PROGRESS' },
          { name: 'Data Quality Monitoring Setup', ...wd('2026-04-30', 4), keyPoints: 'Configure 20 core data quality rules', status: 'TODO' },
          { name: 'Dashboard & Report Build', ...wd('2026-05-06', 5), keyPoints: 'Provide 10 standard reports', status: 'TODO' },
        ],
      },
    },
  })
  console.log(`✓ Project 6: ${p6.name} (5 tasks, In Progress)`)

  // ── 7. Overdue A（红色） ──
  const p7 = await prisma.project.create({
    data: {
      name: 'Q1 Brand Visual Upgrade',
      fullName: 'Q1 Brand Visual Identity System Upgrade',
      plannedStartDate: new Date('2026-01-15'),
      duration: 45,
      description: 'Q1 brand visual system comprehensive upgrade',
      owner: 'Michael Chen',
      completionTime: addDays(new Date('2026-01-15'), 44),
      tasks: {
        create: [
          { name: 'Brand Research & Competitor Analysis', ...wd('2026-01-15', 4), keyPoints: 'Analyze 5 competitors visual strategies', status: 'DONE' },
          { name: 'Visual Positioning & Concept Design', ...wd('2026-01-21', 5), keyPoints: 'Define brand colors, fonts, graphic language', status: 'DONE' },
          { name: 'Main Visual Application', ...wd('2026-01-28', 8), keyPoints: 'Apply to website, social media, etc.', status: 'IN_PROGRESS' },
          { name: 'VI Manual Compilation', ...wd('2026-02-08', 6), keyPoints: 'Complete VI usage guidelines document', status: 'IN_PROGRESS' },
          { name: 'New Visual Communication & Training', ...wd('2026-02-16', 3), keyPoints: 'Company-wide new visual guidelines training', status: 'TODO', favorite: true },
          { name: 'Website Visual Redesign Launch', ...wd('2026-02-22', 4), keyPoints: 'Smooth transition from old to new visual', status: 'TODO' },
        ],
      },
    },
  })
  console.log(`✓ Project 7: ${p7.name} (6 tasks, Overdue)`)

  // ── 8. Overdue B（红色） ──
  const p8 = await prisma.project.create({
    data: {
      name: 'Retail Store Digitalization',
      fullName: 'Offline Store Digital Transformation Project',
      plannedStartDate: new Date('2026-02-01'),
      duration: 35,
      description: 'Digital hardware and software upgrade for 10 flagship stores',
      owner: 'Robert Taylor',
      completionTime: addDays(new Date('2026-02-01'), 34),
      tasks: {
        create: [
          { name: 'Store Survey & Plan Development', ...wd('2026-02-01', 5), keyPoints: 'Cover East China & South China 10 stores', status: 'DONE' },
          { name: 'Hardware Selection & Procurement', ...wd('2026-02-08', 4), keyPoints: 'Smart cameras, interactive screens, etc.', status: 'DONE' },
          { name: 'Store Layout Planning & Construction', ...wd('2026-02-14', 8), keyPoints: 'Power and network infrastructure deployment', status: 'IN_PROGRESS', favorite: true },
          { name: 'SaaS System Deployment & Debugging', ...wd('2026-02-24', 6), keyPoints: 'Connect to HQ data center', status: 'TODO' },
          { name: 'Staff Training & Acceptance', ...wd('2026-03-04', 4), keyPoints: 'At least 2 core staff per store trained', status: 'TODO' },
          { name: 'Official Launch & Support', ...wd('2026-03-10', 3), keyPoints: 'On-site support for first week', status: 'TODO' },
        ],
      },
    },
  })
  console.log(`✓ Project 8: ${p8.name} (6 tasks, Overdue)`)

  // ── 9. Completed A（黑色） ──
  const p9 = await prisma.project.create({
    data: {
      name: 'CRM System Migration',
      fullName: 'CRM System Migration & Launch',
      plannedStartDate: new Date('2026-01-10'),
      duration: 60,
      description: 'Smooth migration from old CRM to new CRM system',
      owner: 'Lisa Anderson',
      completionTime: addDays(new Date('2026-01-10'), 59),
      tasks: {
        create: [
          { name: 'Legacy Data Cleaning & Export', ...wd('2026-01-10', 5), keyPoints: 'Clean 3 years of history, 120K records', status: 'DONE' },
          { name: 'New System Config & Permission Design', ...wd('2026-01-17', 6), keyPoints: 'Design 15 role-based permission templates', status: 'DONE' },
          { name: 'Custom Feature Development', ...wd('2026-01-25', 10), keyPoints: 'Work orders, reports, 5 custom modules', status: 'DONE' },
          { name: 'UAT Testing & Issue Resolution', ...wd('2026-02-08', 8), keyPoints: 'Handle all 47 improvement suggestions', status: 'DONE' },
          { name: 'Historical Data Import & Validation', ...wd('2026-02-18', 5), keyPoints: 'Data consistency reached 99.9%', status: 'DONE' },
          { name: 'Company-wide Training & Launch Support', ...wd('2026-02-25', 4), keyPoints: '4 training sessions for 200 people', status: 'DONE' },
          { name: 'Legacy Data Archiving', ...wd('2026-03-03', 3), keyPoints: 'Complete old system full data archive', status: 'DONE' },
          { name: 'Post-launch Stability Monitoring', ...wd('2026-03-08', 4), keyPoints: 'Zero major incidents for 2 consecutive weeks', status: 'DONE' },
        ],
      },
    },
  })
  console.log(`✓ Project 9: ${p9.name} (8 tasks, Completed)`)

  // ── 10. Completed B（黑色） ──
  const p10 = await prisma.project.create({
    data: {
      name: 'WMS System Upgrade',
      fullName: 'Warehouse Management System v2 to v4 Upgrade',
      plannedStartDate: new Date('2026-02-15'),
      duration: 50,
      description: 'WMS upgrade from v2 to v4 across all warehouses',
      owner: 'David Brown',
      completionTime: addDays(new Date('2026-02-15'), 49),
      tasks: {
        create: [
          { name: 'New Version Feature Evaluation', ...wd('2026-02-15', 4), keyPoints: 'Assess v4 core capability improvements over v2', status: 'DONE' },
          { name: 'Warehouse Process Review & Optimization', ...wd('2026-02-21', 5), keyPoints: 'Optimize 8 core processes including inbound/outbound', status: 'DONE' },
          { name: 'System Integration API Development', ...wd('2026-02-28', 8), keyPoints: 'Seamless integration with ERP and TMS', status: 'DONE' },
          { name: 'Test Environment Setup & Dry Run', ...wd('2026-03-10', 6), keyPoints: 'Simulate real warehouse operations', status: 'DONE' },
          { name: 'Production Deployment & Cutover', ...wd('2026-03-18', 4), keyPoints: 'Zero downtime overnight cutover window', status: 'DONE' },
          { name: 'Operator Training & Certification', ...wd('2026-03-24', 3), keyPoints: 'Cover 6 warehouses, 80 operators', status: 'DONE' },
          { name: 'Launch Acceptance & Issue Handling', ...wd('2026-03-29', 3), keyPoints: 'Handle 23 issues in first week', status: 'DONE' },
        ],
      },
    },
  })
  console.log(`✓ Project 10: ${p10.name} (7 tasks, Completed)`)

  const total = await prisma.task.count()
  console.log(`\n🎉 Seed complete! 10 projects, ${total} tasks`)
  console.log(`📊 Distribution: 2 Not Started (green) | 4 In Progress (blue) | 2 Overdue (red) | 2 Completed (black)`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
