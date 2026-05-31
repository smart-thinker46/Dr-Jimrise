insert into public.site_content (key, value)
values
  ('education', '[
    {"period":"2018 – 2021","degree":"PhD in Applied Mathematics","school":"Chuka University","detail":"Thesis: Mathematical Modelling of Host Pest Interactions in the Presence of Pheromone Traps and Sterile Insects Technique."},
    {"period":"2014 – 2018","degree":"MSc in Applied Mathematics","school":"Chuka University","detail":"Thesis: Modelling Nitrate Leaching into Groundwater Using the Advection–Dispersion Equation."},
    {"period":"2006 – 2010","degree":"BEd in Science (Mathematics & Physics) with IT","school":"Maseno University","detail":""},
    {"period":"2001 – 2004","degree":"Kenya Certificate of Secondary Education (KCSE)","school":"Uriri High School, Migori County","detail":""}
  ]'::jsonb),
  ('experience', '[
    {"period":"2024 – Present","role":"Lecturer","org":"Mama Ngina University College — Dept. of Computing & IT","bullets":["Teaching undergraduate courses in mathematics, statistics and computing.","Supervising student research projects.","Curriculum development and departmental committee work."]},
    {"period":"2018 – Present","role":"Adjunct Lecturer","org":"Chuka University","bullets":["Teaching graduate and undergraduate Applied Mathematics units.","Co-supervising MSc and PhD candidates in mathematical modelling."]},
    {"period":"2023 – 2024","role":"Adjunct Lecturer","org":"Tharaka University","bullets":["Delivered mathematics and statistics units across faculties."]},
    {"period":"2012 – 2024","role":"Mathematics & Physics Teacher","org":"TSC — Ikuu Boys High School","bullets":["Taught KCSE Mathematics and Physics with consistent top performance.","Mentored students in science clubs and national contests."]},
    {"period":"2010 – 2012","role":"Teacher","org":"Raila Education Centre, Nairobi","bullets":["Taught mathematics and the sciences at secondary level."]}
  ]'::jsonb),
  ('grants', '[
    {"title":"Modelling the Nutritional Value of Underutilised Traditional Vegetables","amount":"KES 400,000","period":"2024 – 2025","role":"Principal Investigator"},
    {"title":"Advanced Optimization Techniques for Efficient University Operations (MILP)","amount":"KES 400,000","period":"2024 – 2025","role":"Co-Principal Investigator"}
  ]'::jsonb),
  ('leadership', '[
    {"org":"Mama Ngina University College","items":[{"role":"Chair","text":"Departmental Examinations Committee, Computing & IT"},{"role":"Champion","text":"Research and Innovation, Department of Computing & IT"},{"role":"Member","text":"School Academic Board"},{"role":"Member","text":"Curriculum Review Committee"}]},
    {"org":"Chuka University","items":[{"role":"Co-Chair","text":"Postgraduate Mentorship Working Group"},{"role":"Member","text":"Department of Mathematics Seminar Series Committee"}]},
    {"org":"Teachers Service Commission (TSC)","items":[{"role":"Chair","text":"Mathematics Department, Ikuu Boys High School (2018 – 2024)"},{"role":"Member","text":"School Board of Management Academic Sub-Committee"}]},
    {"org":"Kenya National Examinations Council (KNEC)","items":[{"role":"Examiner","text":"KCSE Mathematics — multiple cycles"},{"role":"Team Leader","text":"Mathematics Marking Centre"}]},
    {"org":"Independent Electoral and Boundaries Commission (IEBC)","items":[{"role":"Presiding Officer","text":"General Elections, Migori County"},{"role":"Trainer","text":"Polling officials, Migori constituency"}]}
  ]'::jsonb),
  ('certifications', '[
    {"title":"Data Scientist with R","issuer":"Johns Hopkins University · Coursera","link":"https://www.coursera.org"},
    {"title":"Data Science Bootcamp with Python","issuer":"Udemy","link":"https://www.udemy.com"},
    {"title":"CPA I & II","issuer":"KASNEB","link":"#"},
    {"title":"IT Essentials","issuer":"CISCO Networking Academy","link":"https://www.netacad.com"}
  ]'::jsonb),
  ('memberships', '[
    "Kenya National Sciences Society (KNSS) — No. 1589621",
    "Mathematical Association of Kenya (MAK)",
    "African Mathematical Modelling Network (AMMnet)"
  ]'::jsonb),
  ('courses', '[
    {"name":"Differential Equations","desc":"Ordinary and partial differential equations, with applications in physics and biology."},
    {"name":"Mathematical Modelling","desc":"Building, analysing and validating models of real-world systems."},
    {"name":"Data Science Methods","desc":"Statistical learning, regression, classification, and Python workflows."}
  ]'::jsonb)
on conflict (key) do nothing;
