-- ============================================================
-- FaceSculpt LMS — Test Data Seed
-- Insert 8 modules, 20 sample lessons, and quizzes
-- ============================================================

-- Clear existing data (careful in production!)
delete from quiz_options;
delete from quiz_questions;
delete from quizzes;
delete from lesson_resources;
delete from student_progress;
delete from lessons;
delete from modules;

-- ============================================================
-- MODULES
-- ============================================================
insert into modules (title, description, order_index, is_published)
values
  ('Skin & Muscle Anatomy', 'Foundations of facial anatomy and physiology', 1, true),
  ('The Science of FaceSculpt™', 'Understanding the science behind the technique', 2, true),
  ('Manual Sculpting Technique', 'Core sculpting methods and application', 3, true),
  ('Practical Demonstrations', 'Video demonstrations of key techniques', 4, true),
  ('Consultation & Treatment Planning', 'Client consultation and assessment', 5, true),
  ('Treatment Protocol', 'Step-by-step treatment workflow', 6, true),
  ('Business, Pricing & Positioning', 'Professional business practices', 7, true),
  ('Certification & Student Success', 'Course completion and next steps', 8, true);

-- ============================================================
-- LESSONS — Module 1: Skin & Muscle Anatomy
-- ============================================================
insert into lessons (module_id, title, type, order_index, content_html, is_published)
select id, 'The three layers of skin', 'theory', 1, '<h2>The Three Layers of Skin</h2><p>The skin consists of three primary layers: epidermis, dermis, and hypodermis...</p>', true
from modules where title = 'Skin & Muscle Anatomy'
union all
select id, 'Skin anatomy quiz', 'quiz', 2, null, true
from modules where title = 'Skin & Muscle Anatomy'
union all
select id, 'How the face ages', 'theory', 3, '<h2>Facial Ageing</h2><p>Ageing affects the skin at multiple layers, including collagen breakdown and loss of elasticity...</p>', true
from modules where title = 'Skin & Muscle Anatomy'
union all
select id, 'The muscles of facial expression', 'theory', 4, '<h2>Facial Muscles</h2><p>Understanding the 43 muscles responsible for facial expressions...</p>', true
from modules where title = 'Skin & Muscle Anatomy'
union all
select id, 'Face mapping & muscle balance', 'theory', 5, '<h2>Face Mapping</h2><p>Techniques for assessing facial balance and muscle symmetry...</p>', true
from modules where title = 'Skin & Muscle Anatomy'
union all
select id, 'The lymphatic system & facial flow', 'theory', 6, '<h2>Lymphatic System</h2><p>How the lymphatic system supports facial health and drainage...</p>', true
from modules where title = 'Skin & Muscle Anatomy';

-- ============================================================
-- LESSONS — Module 2: The Science of FaceSculpt™
-- ============================================================
insert into lessons (module_id, title, type, order_index, content_html, is_published)
select id, 'Ageing at every layer', 'theory', 1, '<h2>Multi-Layer Ageing</h2><p>How ageing affects each layer of the skin and underlying structures...</p>', true
from modules where title = 'The Science of FaceSculpt™'
union all
select id, 'Why fascia release comes first', 'theory', 2, '<h2>Fascia Release Protocol</h2><p>The importance of releasing fascia before other techniques...</p>', true
from modules where title = 'The Science of FaceSculpt™'
union all
select id, 'Fascia release quiz', 'quiz', 3, null, true
from modules where title = 'The Science of FaceSculpt™'
union all
select id, 'Understanding EMS technology', 'theory', 4, '<h2>EMS (Electrical Muscle Stimulation)</h2><p>How EMS devices work and their benefits in facial sculpting...</p>', true
from modules where title = 'The Science of FaceSculpt™'
union all
select id, 'EMS settings and intensity', 'theory', 5, '<h2>EMS Settings</h2><p>Optimal settings, intervals, and intensity for different client types...</p>', true
from modules where title = 'The Science of FaceSculpt™';

-- ============================================================
-- LESSONS — Module 3: Manual Sculpting Technique
-- ============================================================
insert into lessons (module_id, title, type, order_index, content_html, is_published)
select id, 'What sculpting actually is', 'theory', 1, '<h2>Sculpting Fundamentals</h2><p>The core principles of facial sculpting and what it achieves...</p>', true
from modules where title = 'Manual Sculpting Technique'
union all
select id, 'Reading the face before you start', 'theory', 2, '<h2>Pre-Treatment Assessment</h2><p>How to analyse the client''s face and plan the treatment...</p>', true
from modules where title = 'Manual Sculpting Technique'
union all
select id, 'Pressure & pace guidelines', 'theory', 3, '<h2>Technique Parameters</h2><p>Correct pressure and pace for different areas and client types...</p>', true
from modules where title = 'Manual Sculpting Technique'
union all
select id, 'Sculpting techniques quiz', 'quiz', 4, null, true
from modules where title = 'Manual Sculpting Technique';

-- ============================================================
-- LESSONS — Module 4: Practical Demonstrations
-- ============================================================
insert into lessons (module_id, title, type, order_index, content_html, is_published)
select id, 'Full FaceSculpt™ treatment — start to finish', 'video', 1, null, true
from modules where title = 'Practical Demonstrations'
union all
select id, 'Lymphatic drainage pathways', 'video', 2, null, true
from modules where title = 'Practical Demonstrations'
union all
select id, 'Jawline sculpting & release', 'video', 3, null, true
from modules where title = 'Practical Demonstrations'
union all
select id, 'Mid-face lift & cheekbone definition', 'video', 4, null, true
from modules where title = 'Practical Demonstrations'
union all
select id, 'Under-eye & periorbital de-puffing', 'video', 5, null, true
from modules where title = 'Practical Demonstrations';

-- ============================================================
-- LESSONS — Module 5: Consultation & Treatment Planning
-- ============================================================
insert into lessons (module_id, title, type, order_index, content_html, is_published)
select id, 'Why consultation is where results start', 'theory', 1, '<h2>Consultation Importance</h2><p>How effective consultation drives treatment success...</p>', true
from modules where title = 'Consultation & Treatment Planning'
union all
select id, 'Medical history & contraindications', 'theory', 2, '<h2>Health Screening</h2><p>Identifying contraindications and assessing client suitability...</p>', true
from modules where title = 'Consultation & Treatment Planning'
union all
select id, 'Facial assessment', 'theory', 3, '<h2>Assessment Techniques</h2><p>Methods for comprehensive facial analysis...</p>', true
from modules where title = 'Consultation & Treatment Planning'
union all
select id, 'Creating a bespoke treatment plan', 'theory', 4, '<h2>Treatment Planning</h2><p>Designing customised treatment protocols for individual clients...</p>', true
from modules where title = 'Consultation & Treatment Planning';

-- ============================================================
-- LESSONS — Module 6: Treatment Protocol
-- ============================================================
insert into lessons (module_id, title, type, order_index, content_html, is_published)
select id, 'Room setup & preparation', 'theory', 1, '<h2>Treatment Environment</h2><p>Creating the ideal space and preparing for treatment...</p>', true
from modules where title = 'Treatment Protocol'
union all
select id, 'Client arrival & pre-treatment check', 'theory', 2, '<h2>Client Greeting Protocol</h2><p>Professional greeting and final health checks...</p>', true
from modules where title = 'Treatment Protocol'
union all
select id, 'Cleanse & skin preparation', 'theory', 3, '<h2>Preparation Steps</h2><p>Proper cleansing and preparing the skin for treatment...</p>', true
from modules where title = 'Treatment Protocol'
union all
select id, 'Lymphatic opening sequence', 'theory', 4, '<h2>Opening Sequence</h2><p>The foundational lymphatic drainage opening...</p>', true
from modules where title = 'Treatment Protocol'
union all
select id, 'Manual sculpting flow', 'theory', 5, '<h2>Sculpting Flow</h2><p>The core sculpting sequence and technique flow...</p>', true
from modules where title = 'Treatment Protocol';

-- ============================================================
-- LESSONS — Module 7: Business, Pricing & Positioning
-- ============================================================
insert into lessons (module_id, title, type, order_index, content_html, is_published)
select id, 'Positioning FaceSculpt™ as a premium treatment', 'theory', 1, '<h2>Premium Positioning</h2><p>Marketing FaceSculpt™ as a luxury professional service...</p>', true
from modules where title = 'Business, Pricing & Positioning'
union all
select id, 'Pricing for profit', 'theory', 2, '<h2>Pricing Strategy</h2><p>Setting prices that reflect value and ensure profitability...</p>', true
from modules where title = 'Business, Pricing & Positioning'
union all
select id, 'High-converting consultations', 'theory', 3, '<h2>Sales Consultation</h2><p>Consultation techniques that convert to bookings...</p>', true
from modules where title = 'Business, Pricing & Positioning';

-- ============================================================
-- LESSONS — Module 8: Certification & Student Success
-- ============================================================
insert into lessons (module_id, title, type, order_index, content_html, is_published)
select id, 'How certification works', 'info', 1, '<h2>Certification Overview</h2><p>Your FaceSculpt™ certification is awarded upon 100% course completion...</p>', true
from modules where title = 'Certification & Student Success'
union all
select id, 'Downloadable resources', 'download', 2, null, true
from modules where title = 'Certification & Student Success';

-- ============================================================
-- QUIZZES
-- ============================================================
-- Module 1, Lesson 2: Skin anatomy quiz
insert into quizzes (lesson_id, pass_mark)
select id, 80
from lessons
where title = 'Skin anatomy quiz'
and module_id = (select id from modules where title = 'Skin & Muscle Anatomy');

-- Module 2, Lesson 3: Fascia release quiz
insert into quizzes (lesson_id, pass_mark)
select id, 80
from lessons
where title = 'Fascia release quiz'
and module_id = (select id from modules where title = 'The Science of FaceSculpt™');

-- Module 3, Lesson 4: Sculpting techniques quiz
insert into quizzes (lesson_id, pass_mark)
select id, 80
from lessons
where title = 'Sculpting techniques quiz'
and module_id = (select id from modules where title = 'Manual Sculpting Technique');

-- ============================================================
-- QUIZ QUESTIONS & OPTIONS
-- ============================================================
-- Skin anatomy quiz questions
insert into quiz_questions (quiz_id, question_text, order_index)
select q.id, 'Which layer of skin contains collagen and elastin?', 1
from quizzes q
join lessons l on q.lesson_id = l.id
where l.title = 'Skin anatomy quiz'
limit 1;

insert into quiz_options (question_id, option_text, is_correct, order_index)
select id, 'Epidermis', false, 1 from quiz_questions where question_text = 'Which layer of skin contains collagen and elastin?' limit 1;

insert into quiz_options (question_id, option_text, is_correct, order_index)
select id, 'Dermis', true, 2 from quiz_questions where question_text = 'Which layer of skin contains collagen and elastin?' limit 1;

insert into quiz_options (question_id, option_text, is_correct, order_index)
select id, 'Hypodermis', false, 3 from quiz_questions where question_text = 'Which layer of skin contains collagen and elastin?' limit 1;

-- Fascia release quiz question
insert into quiz_questions (quiz_id, question_text, order_index)
select q.id, 'Why is fascia release performed first in the protocol?', 1
from quizzes q
join lessons l on q.lesson_id = l.id
where l.title = 'Fascia release quiz'
limit 1;

insert into quiz_options (question_id, option_text, is_correct, order_index)
select id, 'To increase blood flow to the area', false, 1 from quiz_questions where question_text = 'Why is fascia release performed first in the protocol?' limit 1;

insert into quiz_options (question_id, option_text, is_correct, order_index)
select id, 'To release tension and prepare deeper tissues for treatment', true, 2 from quiz_questions where question_text = 'Why is fascia release performed first in the protocol?' limit 1;

insert into quiz_options (question_id, option_text, is_correct, order_index)
select id, 'To numb the area', false, 3 from quiz_questions where question_text = 'Why is fascia release performed first in the protocol?' limit 1;

-- Sculpting techniques quiz question
insert into quiz_questions (quiz_id, question_text, order_index)
select q.id, 'What is the recommended pressure level for facial sculpting?', 1
from quizzes q
join lessons l on q.lesson_id = l.id
where l.title = 'Sculpting techniques quiz'
limit 1;

insert into quiz_options (question_id, option_text, is_correct, order_index)
select id, 'Very firm pressure (9-10/10)', false, 1 from quiz_questions where question_text = 'What is the recommended pressure level for facial sculpting?' limit 1;

insert into quiz_options (question_id, option_text, is_correct, order_index)
select id, 'Medium pressure (6-7/10)', true, 2 from quiz_questions where question_text = 'What is the recommended pressure level for facial sculpting?' limit 1;

insert into quiz_options (question_id, option_text, is_correct, order_index)
select id, 'Very light touch (1-2/10)', false, 3 from quiz_questions where question_text = 'What is the recommended pressure level for facial sculpting?' limit 1;

-- ============================================================
-- SAMPLE STUDENT PROGRESS
-- Create progress for the first user (from auth) to show dashboard in action
-- ============================================================
-- Get the first user from auth.users
insert into student_progress (user_id, lesson_id, status, completed_at)
select
  (select id from auth.users limit 1),
  l.id,
  case when l.order_index <= 3 then 'complete' else 'not_started' end,
  case when l.order_index <= 3 then now() else null end
from lessons l
where l.module_id = (select id from modules where title = 'Skin & Muscle Anatomy')
on conflict (user_id, lesson_id) do update set
  status = excluded.status,
  completed_at = excluded.completed_at;

-- Module 2: 2 lessons complete
insert into student_progress (user_id, lesson_id, status, completed_at)
select
  (select id from auth.users limit 1),
  l.id,
  case when l.order_index <= 2 then 'complete' else 'not_started' end,
  case when l.order_index <= 2 then now() else null end
from lessons l
where l.module_id = (select id from modules where title = 'The Science of FaceSculpt™')
on conflict (user_id, lesson_id) do update set
  status = excluded.status,
  completed_at = excluded.completed_at;

-- Module 3+: all not_started
insert into student_progress (user_id, lesson_id, status)
select
  (select id from auth.users limit 1),
  l.id,
  'not_started'
from lessons l
where l.module_id in (
  select id from modules
  where title in ('Manual Sculpting Technique', 'Practical Demonstrations', 'Consultation & Treatment Planning', 'Treatment Protocol', 'Business, Pricing & Positioning', 'Certification & Student Success')
)
on conflict (user_id, lesson_id) do nothing;
