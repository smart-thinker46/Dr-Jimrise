insert into public.site_content (key, value)
values
  ('personal_info', $json$[
    {"label":"Full Name","value":"Dr. Jimrise Ochwach, PhD"},
    {"label":"Job Category","value":"Teaching and Research"},
    {"label":"Current Position","value":"Lecturer, Applied Mathematics"},
    {"label":"Institution","value":"Mama Ngina University College"},
    {"label":"Department","value":"Computing and Information Technology"},
    {"label":"Birth Date","value":"08 June 1986"},
    {"label":"Nationality","value":"Kenyan"},
    {"label":"Marital Status","value":"Married"}
  ]$json$::jsonb),
  ('research_interests', $json$[
    "Mathematical Modelling",
    "Dynamical Systems in Epidemiology",
    "Fluid Dynamics",
    "Data Science",
    "Machine Learning"
  ]$json$::jsonb),
  ('skills', $json$[
    {"label":"Languages","value":"Fluent in English, Kiswahili and Luo; working knowledge of Abasuba and Kimeru."},
    {"label":"Programming","value":"Python, R, SQL, Matlab, Mathematica, LaTeX."},
    {"label":"Databases","value":"MySQL, PostgreSQL."},
    {"label":"Web Development","value":"HTML, CSS."},
    {"label":"Academic Tools","value":"LaTeX typesetting, academic publishing, technical writing, teaching and research supervision."}
  ]$json$::jsonb),
  ('education', $json$[
    {"period":"2018 – 2021","degree":"PhD in Applied Mathematics","school":"Chuka University","detail":"Thesis: Mathematical Modelling of Host Pest Interactions in the Presence of Pheromone Traps and Sterile Insects Technique: A Case of False Codling Moth (Thaumatotibia leucotreta (Meyrick)."},
    {"period":"2014 – 2018","degree":"MSc in Applied Mathematics","school":"Chuka University","detail":"Thesis: Modelling Nitrate Leaching into Groundwater Using the Advection–Dispersion Equation."},
    {"period":"2006 – 2010","degree":"BEd in Science (Mathematics and Physics) with IT","school":"Maseno University","detail":""},
    {"period":"2001 – 2004","degree":"Kenya Certificate of Secondary Education (B+ Grade)","school":"Uriri High School, Migori County","detail":""},
    {"period":"1993 – 2000","degree":"Kenya Certificate of Primary Education (B Grade)","school":"Wasamo Primary School, Homa Bay County","detail":""}
  ]$json$::jsonb),
  ('experience', $json$[
    {"period":"2024 – Present","role":"Lecturer","org":"Department of Computing and Information Technology, School of Pure and Applied Sciences, Mama Ngina University College","bullets":["Teach undergraduate courses in differential equations and mathematical modelling.","Supervise BSc, MSc, and PhD research in Applied Mathematics."]},
    {"period":"2018 – Present","role":"Adjunct Lecturer","org":"Department of Physical Sciences, Faculty of Science and Technology, Chuka University","bullets":["Teach undergraduate courses in differential equations and mathematical modelling.","Supervise undergraduate and postgraduate research in Applied Mathematics."]},
    {"period":"2023 – 2024","role":"Adjunct Lecturer","org":"Department of Basic Sciences, Faculty of Life Sciences, Engineering and Technology, Tharaka University","bullets":["Delivered undergraduate instruction in applied mathematics.","Supervised BSc and MSc research projects."]},
    {"period":"2012 – 2024","role":"Mathematics and Physics Teacher","org":"Teacher Service Commission (TSC), Ikuu Boys High School, Tharaka Nithi County","bullets":["Held ranks from Secondary Teacher II (C2) to Senior Master IV (C4).","Taught Mathematics and Physics to students in Grades 9–12.","Managed internal assessments and examination processes.","Trained and coached students in co-curricular activities."]},
    {"period":"2010 – 2012","role":"Mathematics and Physics Teacher","org":"Board of Management (BoM), Raila Education Centre, Nairobi County","bullets":["Taught Mathematics and Physics at secondary level."]},
    {"period":"2008","role":"Volunteer Mathematics and Physics Teacher","org":"Nyarach Mixed Secondary School","bullets":["Delivered instruction in Mathematics and Physics."]}
  ]$json$::jsonb),
  ('leadership', $json$[
    {"org":"Mama Ngina University College","items":[
      {"role":"Champion","text":"Research Grant Writing (Jul 2025–Present): identifies, analyzes, and delivers calls for available research grants."},
      {"role":"Chair","text":"Ad-Hoc Library Stock Taking Committee (Jun 2025): led the 2024/2025 stock-taking exercise and submitted a comprehensive report."},
      {"role":"Ag. Chair","text":"Department of Environmental and Hospitality (May–Sep 2025): oversaw departmental operations and academic activities."},
      {"role":"Champion","text":"STI Champion (Mar 2025–Present): monitors and evaluates Science, Technology, and Innovation activities."},
      {"role":"Member","text":"Student Disciplinary Appeals Committee (Mar 2025–Present): reviews appeals from the student disciplinary process."},
      {"role":"Chair","text":"ODeL Committee (Mar 2025–Present): developed a strategic plan and policy for Open, Distance, and e-Learning integration."},
      {"role":"Co-Chair","text":"Gender Mainstreaming Committee (Jan 2025–Present): formulated and implemented a workplace gender-based violence policy."},
      {"role":"Chair","text":"SAMNUC Constitutional Oversight Committee (Nov 2024–Present): guided implementation of the student congress constitution."},
      {"role":"Program Leader","text":"Mathematics and Computer Science (Sep 2024–Present): coordinates curriculum design, execution, evaluation, and review."},
      {"role":"Member","text":"Academic Quality Assurance Committee (Sep 2024–Present): supports academic quality systems oversight and evaluation."},
      {"role":"Member","text":"CBC Implementation Committee (Sep 2024–Present): engages stakeholders in integrating Competency-Based Curriculum."},
      {"role":"Member","text":"Quality Management Committee (Sep 2024–Present): contributes to institutional quality policy development."},
      {"role":"Member","text":"Career Day Committee (Nov 2024–Mar 2025): planned and executed the 2025 Career Day."},
      {"role":"Member","text":"Accreditation for Charter Committee (Oct 2024–May 2025): prepared and submitted documentation to the Commission for University Education."},
      {"role":"Member","text":"Market Survey Committee (Oct–Nov 2024): conducted market analysis for infrastructural procurement."}
    ]},
    {"org":"Chuka University","items":[
      {"role":"Member","text":"Ethics Committee (Mar 2018–Aug 2023): reviewed Master’s research proposals and ensured compliance."}
    ]},
    {"org":"Teachers Service Commission / Ikuu Boys High School","items":[
      {"role":"Dean of Studies","text":"Ikuu Boys High School (Jan 2015–Aug 2024): oversaw academic programming, evaluation, and timetable management."},
      {"role":"Trainer of Trainers","text":"CBC Implementation (Mar 2022–Mar 2024): trained school principals and teachers on CBC delivery strategies."},
      {"role":"Trainer of Trainers","text":"SEQIP (Jan 2020–Mar 2022): trained teachers in ASAL regions under the SBTSS framework."}
    ]},
    {"org":"National Service and Electoral Roles","items":[
      {"role":"Examiner","text":"Physics Examiner, Kenya National Examination Council (Apr 2017–Aug 2024): marked Physics Paper 1 for KCSE examinations."},
      {"role":"Presiding Officer","text":"IEBC (Aug 2017, Aug 2022): managed polling stations during general elections."},
      {"role":"ICT Supervisor","text":"Kenya National Bureau of Statistics (Jul–Sep 2019): supervised the 2019 Kenya Population and Housing Census in Tharaka Nithi County."}
    ]},
    {"org":"Student Leadership","items":[
      {"role":"Secretary General","text":"Students Organization of Maseno University (Sep 2008–Sep 2009): represented students in Senate and Council and acted as student spokesperson."}
    ]}
  ]$json$::jsonb),
  ('grants', $json$[
    {"title":"Modelling the Nutritional Value of Underutilized Traditional Vegetables in Ngenda Location, Kiambu County","type":"Internally awarded research grant","funding_body":"Mama Ngina University College","amount":"KES 400,000","period":"2024–2025","role":"Principal Investigator"},
    {"title":"Advanced Optimization Techniques for Efficient University Operations — A Mixed Integer Linear Programming (MILP) Approach","type":"Internally awarded research grant","funding_body":"Mama Ngina University College, implemented by the School of Pure and Applied Sciences","amount":"KES 400,000","period":"2024–2025","role":"Co-Principal Investigator"}
  ]$json$::jsonb),
  ('certifications', $json$[
    {"period":"2022","title":"The Data Scientist with R","issuer":"Johns Hopkins University, Coursera","link":"https://www.coursera.org/account/accomplishments/certificate/WVNV93YREV8F"},
    {"period":"2022","title":"Data Science Bootcamp with Python","issuer":"Udemy","link":"https://ude.my/UC-2a9059e4-f7e1-4c1e-8d1e-77646ec9bac1"},
    {"period":"2013","title":"Certified Public Accountants Part I and II (CPA I & II)","issuer":"KASNEB","link":"#"},
    {"period":"2011","title":"IT Essentials: PC Hardware and Software","issuer":"CISCO","link":"#"},
    {"period":"2006","title":"Micro-Computer Software Applications","issuer":"Goread Library and ICT Services","link":"#"}
  ]$json$::jsonb),
  ('memberships', $json$[
    "Kenya National Statistical Society (KNSS), Membership number: 1589621",
    "Mathematics Association of Kenya (MAK)",
    "The Applied Malaria Modeling Network (AMMnet)"
  ]$json$::jsonb),
  ('thesis_examinations', $json$[
    {"name":"Grace Makena Njoka","title":"Modelling of Predictors of Diabetic Kidney Disease Among Diabetic Patients","degree":"MSc Applied Statistics Thesis","institution":"Chuka University","date":"September 2024"}
  ]$json$::jsonb),
  ('community_outreach', $json$[
    {"period":"2024–Present","role":"Chair","org":"Jaseco Welfare Group"},
    {"period":"2024–Present","role":"Member","org":"Mama Ngina University College Staff Welfare Association"},
    {"period":"2022–Present","role":"Secretary, Development Committee","org":"Full Gospel Church – Karandini"},
    {"period":"2021–Present","role":"Member","org":"Great Lakes Welfare Group, Chuka University"},
    {"period":"2015–2024","role":"Investment Chair","org":"New Ikuu Teachers Welfare Association (NITWA)"},
    {"period":"2012–2024","role":"Member","org":"New Ikuu Teachers Welfare Association (NITWA)"},
    {"period":"2012–2024","role":"Member","org":"Kenya Union of Post Primary Education Teachers (KUPPET)"},
    {"period":"2014–2023","role":"Member","org":"Ikuu Boys Educational Outreach Program"},
    {"period":"Feb–Apr 2008","role":"Volunteer Teacher, Physics and Mathematics","org":"Nyarach Secondary School"},
    {"period":"8 Jun 2008","role":"Community Clean-Up","org":"Nyanza Provincial Hospital, Kenya Red Cross Maseno Chapter"},
    {"period":"28 Feb 2007","role":"Community Clean-Up","org":"Maseno University, SOMU"},
    {"period":"24 Feb 2007","role":"Community Clean-Up","org":"Lwanda, Kenya Red Cross–Maseno Chapter"}
  ]$json$::jsonb),
  ('electoral_engagement', $json$[
    {"year":"2022","role":"Deputy Presiding Officer","event":"General Elections, Kenya"},
    {"year":"2017","role":"Presiding Officer","event":"General Elections, Kenya"},
    {"year":"2013","role":"Deputy Presiding Officer","event":"General Elections, Kenya"},
    {"year":"2007","role":"Polling Clerk","event":"General Elections, Kenya"}
  ]$json$::jsonb),
  ('workshops_training', $json$[
    {"year":"2024","title":"Workshop on malaria modelling using R software","detail":"29–30 August; focused on data-driven strategies to combat malaria in Kenya."},
    {"year":"2020","title":"SBTSS Training Workshop – Education Technologist","detail":"Kitui TTC, 29 January – 1 February."},
    {"year":"2019","title":"Curriculum design workshop for Senior School (Grades 10–12), Physics and Physical Sciences","detail":"KICD Nairobi, 16–20 December."},
    {"year":"2019","title":"ICT Supervisor Training for 2019 Population and Housing Census using CAPI","detail":"Kenya School of Government, Embu, 24 July–1 August."},
    {"year":"2017","title":"KNEC Examiner Training for Physics Paper 1","detail":"State House Girls, Nairobi, 24–29 April."},
    {"year":"2016","title":"Rugby Coaching Workshop","detail":"Sub-County Secondary Sports Training, Ikuu Boys, 27 February."},
    {"year":"2015","title":"Physics and Mathematics Workshop","detail":"Magumoni Girls, 2 June."},
    {"year":"2014","title":"SMASE In-Service Training","detail":"Chuka Girls High School, 25–29 August."},
    {"year":"2009","title":"Gender Mainstreaming Workshop","detail":"Maseno University, 31 July–1 August."},
    {"year":"2009","title":"Life Skills Training","detail":"Maseno University, 13–15 March."},
    {"year":"2009","title":"Peace Leader Training","detail":"Maseno University, 13 March."},
    {"year":"2007","title":"Disaster Management Training","detail":"Kenya Red Cross, Maseno University, 24 March–1 April."},
    {"year":"2007","title":"HIV/AIDS Peer Educator Training","detail":"I Choose Life Africa, Maseno University, 14 November."},
    {"year":"2007","title":"Community-Based First Aid Training","detail":"Kenya Red Cross, Maseno University, April."}
  ]$json$::jsonb),
  ('awards', $json$[
    {"year":"2023","text":"Recognized for service as Rugby Coach, Eastern Region Games (Term II), Machakos Boys High School — team placed 4th."},
    {"year":"2022","text":"Appreciation for coaching Rugby Team, Eastern Region Games (Term I), Kangaru Boys High School — team placed 3rd."},
    {"year":"2019","text":"Commended for Rugby Coaching, Tharaka Nithi County Games (Term I), Chuka Boys High School — team placed 1st."},
    {"year":"2018","text":"Successfully coached Rugby 15s and 7s teams to regional, county, and sub-county placements."},
    {"year":"2017","text":"Coordinator, Energy Transport, Meru South District Science & Engineering Fair, 17–18 March."},
    {"year":"2016","text":"Participated in Kenya National Music Festival, Nairobi, 17 August; Junior Rugby Coach, HIGHRESSSA Term I Championship — team placed 3rd."},
    {"year":"2015","text":"Organized and launched the 1st Ikuu Boys Mathematics Contest."},
    {"year":"2013","text":"Awarded merit certificate — Physics mean score 9.052, top in Meru South Sub-County; Chief Technical Advisor, 51st Kenya Science & Engineering Fair; named Best Physics Teacher, Tharaka Nithi County."},
    {"year":"2009","text":"Team Manager, Maseno University Delegation to East Africa Inter-University Games, Uganda, 3–8 February."}
  ]$json$::jsonb),
  ('personal_interests', $json$["Travelling","Reading novels, spiritual and motivational books"]$json$::jsonb),
  ('references_note', $json${"text":"References available on request."}$json$::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Seed supervision from the detailed CV.
delete from public.publications
where title = 'New paper'
  and kind = 'journal'
  and coalesce(authors, '') = ''
  and coalesce(venue, '') = ''
  and year = 2026;

insert into public.supervision (level, name, title, school, sort_order)
select level, name, title, school, sort_order
from (values
  ('phd','Alex Rwanda','Mathematical Model of Unsteady Micropolar MHD Fluid Flow on Nonlinear Stretching Sheet under Inclined Magnetic Field','PhD in Applied Mathematics, Department of Physical Sciences, Chuka University (2022–Present)',1),
  ('msc_completed','Henri Milimo','Mathematical Modelling of SARS-COV-2 in Kenya Incorporating Non Pharmaceutical Interventions Coupled with Vaccination','MSc in Applied Mathematics, Department of Physical Sciences, Chuka University (2021–2023)',1),
  ('msc_completed','Chege Kimani Samuel','Mathematical Modelling of the Control of Alcoholism Incorporating Treatment with Reference to Mount Kenya Counties','MSc in Applied Mathematics, Department of Physical Sciences, Chuka University (2022–2024)',2),
  ('msc_ongoing','Kimanthi Angela Mbaika','Modelling the Effect of Stigma in Tuberculosis in the Presence of Counselling','MSc in Applied Mathematics, Department of Physical Sciences, Chuka University (2021–Present)',1),
  ('msc_ongoing','Amos Kiugo','Modelling Locust Plague with Surveillance Treatment on the Breeding Zones','MSc in Applied Mathematics, Department of Physical Sciences, Chuka University (2022–Present)',2),
  ('msc_ongoing','Julius Njiru Nyagah','Modelling the Dispersion of Air Pollutants in the Atmospheric Boundary Layer using a Two-Dimensional Advection–Dispersion Equation','MSc in Applied Mathematics, Department of Physical Sciences, Chuka University (2022–Present)',3),
  ('msc_ongoing','Ngari W. Maureen','Modelling the Impact of Unemployment and ARV Treatment Literacy on HIV/AIDS Transmission Among Women in Kenya','MSc in Applied Mathematics, Department of Physical Sciences, Chuka University (2021–Present)',4),
  ('msc_ongoing','Nicholus Waithaga','Mathematical Modelling of Healthy Cell–Tumor Cell Interactions with Radiotherapy Integration','MSc in Applied Mathematics, Department of Basic Sciences, Tharaka University (2024–Present)',5)
) as s(level, name, title, school, sort_order)
where not exists (select 1 from public.supervision existing where existing.name = s.name and existing.title = s.title);

-- Seed refereed journal articles and conference presentations from the detailed CV.
insert into public.publications (kind, title, authors, venue, year, doi, sort_order)
select kind, title, authors, venue, year, doi, sort_order
from (values
  ('journal','Hydromagnetic casson nanofluid flow past a wedge in a porous medium in the presence of induced magnetic field','N. Danson, J. Ochwach, K. Jacob, and M. Okongo','American Journal of Applied Mathematics, vol. 13, no. 1, pp. 30–56',2025,'https://doi.org/10.11648/j.ajam.20251301.13',1),
  ('journal','A mathematical model for effective fungicide use in rice blast re-infection','J. Ochwach, O. B., and O. M. O.','Journal of Mathematical Analysis and Modeling, vol. 6, no. 1, pp. 117–143',2025,null,2),
  ('journal','Mathematical modelling with optimal control of infectious diseases with vaccination','H. M. Wanjala, M. O. Okongo, and J. O. Ochwach','Computational Methods for Differential Equations',2025,'https://doi.org/10.22034/cmde.2024.62350.2743',3),
  ('journal','Mathematical model of an infectious respiratory disease with a double-dose vaccine, isolation and use of face-mask','H. M. Wanjala, M. O. Okongo, and J. Ochwach','International Journal of Mathematical Sciences and Computing, vol. 11, no. 2, pp. 10–27',2025,'https://doi.org/10.5815/ijmsc.2025.02.02',4),
  ('journal','Mathematical model of alcoholism incorporating treatment: A case study in Kenya','S. Chege, M. O. Okongo, and J. O. Ochwach','Journal of Mathematics Instruction, Social Research and Opinion, vol. 4, no. 1, pp. 73–90',2024,'https://doi.org/10.58421/misro.v4i1.316',5),
  ('journal','Modelling fluid flow in zone 2 of an open horseshoe channel with lateral inflow channels','J. Jason, M. Okongo, J. Kirimi, and J. Ochwach','Journal of Advances in Mathematics and Computer Science, vol. 39, no. 8, pp. 33–42',2024,'https://doi.org/10.9734/jamcs/2024/v39i81919',6),
  ('journal','Modelling fluid flow of an open horseshoe channel with lateral inflow channels','J. Jason, M. Okongo, J. Kirimi, and J. Ochwach','Journal of Advances in Mathematics and Computer Science, vol. 39, no. 7, pp. 34–44',2024,'https://doi.org/10.9734/jamcs/2024/v39i71910',7),
  ('journal','Modeling the impact of flow parameters on fluid velocity and temperature in an electrically conducting fluid past a wedge','D. Nyaga, J. Kirimi, J. Ochwach, and M. Okongo','International Journal of Multidisciplinary Sciences and Engineering, vol. 15, no. 4',2024,null,8),
  ('journal','Mathematical modelling for rice blast re-infection','B. O. Obita, M. O. Okongo, J. O. Ochwach, and A. M. Lunani','American Journal of Applied Mathematics, vol. 12, no. 2, pp. 37–49',2024,'https://doi.org/10.11648/j.ajam.20241202.12',9),
  ('journal','Bifurcation analysis of an infectious respiratory disease with lockdown and social distancing','H. Wanjala, M. Okongo, and J. Ochwach','ARRUS Journal of Mathematics and Applied Science, vol. 4, no. 2, pp. 118–134',2024,null,10),
  ('journal','Mathematical model of the impact of home-based care on contagious respiratory illness under optimal conditions','H. M. Wanjala, M. O. Okongo, and J. O. Ochwach','Jambura Journal of Biomathematics, vol. 5, no. 2, pp. 83–94',2024,'https://doi.org/10.37905/jjbm.v5i2.27611',11),
  ('journal','Stability analysis of a sterile insect technique model for controlling false codling moth','J. Ochwach, M. Okongo, and M. Muraya','Journal of Mathematical Analysis and Modeling, vol. 4, no. 1, pp. 78–105',2023,null,12),
  ('journal','On basic reproduction number R0: Derivation and application','J. O. Ochwach, M. O. Okongo, and A. L. M. Murwayi','Journal of Engineering and Applied Sciences Technology, SRC/JEAST-234',2023,'https://doi.org/10.47363/JEAST/2023(5)173',13),
  ('journal','The impact of HIV/AIDS treatment and counseling on the prevalence of tuberculosis and malaria co-infections','M. O. Okongo, M. A. Lunani, B. K. Menge, and J. O. Ochwach','International Journal of Mathematical Analysis, vol. 17, no. 2, pp. 51–67',2023,'https://doi.org/10.12988/ijma.2023.511270',14),
  ('journal','Impact of media awareness and use of face-masks on infectious respiratory disease','H. M. Wanjala, M. O. Okongo, and J. O. Ochwach','Pan-American Journal of Mathematics, vol. 2, p. 15',2023,null,15),
  ('journal','Mathematical modelling of cholera incorporating the dynamics of the induced achlorhydria condition and treatment','C. Ngari, C. G. Ngari, M. Okongo, and J. Ochwach','Journal of Progressive Research in Mathematics, vol. 19, no. 2, pp. 60–88',2022,'http://scitecresearch.com/journals/index.php/jprm/article/view/2168',16),
  ('journal','Mathematical modelling and simulation of nitrate leaching into groundwater','J. Ochwach, M. Okongo, and O. Ochieng','International Journal of Systems Science and Applied Mathematics, vol. 7, no. 4, pp. 74–84',2022,'https://doi.org/10.11648/j.ijssam.20220704.12',17),
  ('journal','Mathematical model for false codling moth control using pheromone traps','J. Ochwach, M. O. Okongo, and M. M. Muraya','International Journal of Applied Mathematical Research, vol. 10, no. 2, pp. 32–52',2021,null,18),
  ('journal','Mathematical modelling of host-pest interactions in stage-structured populations: A case of false codling moth (Thaumatotibia leucotreta)','J. O. Ochwach, M. O. Okongo, and M. M. Muraya','Journal of Progressive Research in Mathematics, vol. 18, no. 4, pp. 1–21',2021,'http://scitecresearch.com/journals/index.php/jprm/article/view/2087',19),
  ('journal','Stability analysis of the modified advection-dispersion model for the leaching of nitrates into groundwater','O. J. Ochwach, S. W. Musundi, and M. O. Okongo','Journal of Progressive Research in Mathematics, vol. 14, no. 2',2018,null,20),
  ('journal','Modelling the impact of soil porosity on nitrate leaching to groundwater using the advection dispersion equation','O. J. Ochwach, M. O. Okongo, and S. W. Musundi','IOSR Journal of Mathematics, vol. 14, no. 4, pp. 18–26',2018,'http://www.iosrjournals.org',21),
  ('conference','Mathematical modeling on the impact of lockdown and social distancing on an infectious respiratory disease','H. M. Wanjala, M. O. Okongo, and J. Ochwach','15th KEMRI Annual Scientific and Health Conference',2025,null,1),
  ('conference','Mathematical model of alcoholism incorporating treatment: A case study in Kenya','S. C. Kimani, J. O. Ochwach, and M. O. Okongo','11th Chuka University Annual International Conference',2024,null,2),
  ('conference','Mathematical model of COVID-19 with a double-dose vaccine','H. M. Wanjala, M. O. Okongo, and J. Ochwach','14th KEMRI Annual Scientific & Health Conference, Safari Park Hotel and Casino',2023,'https://www.kemri.go.ke/wp-content/uploads/2024/02/14-KASH-ABSTRACT-BOOK-1.pdf',3),
  ('conference','The impact of home-based care on infectious respiratory disease: A case of COVID-19','H. M. Wanjala, M. O. Okongo, and J. Ochwach','14th KEMRI Annual Scientific & Health Conference, Safari Park Hotel and Casino',2023,'https://www.kemri.go.ke/wp-content/uploads/2024/02/14-KASH-ABSTRACT-BOOK-1.pdf',4),
  ('conference','COVID-19 transmission dynamics model with double-dose vaccination and use of face masks: A case study in Kenya','H. M. Wanjala, M. O. Okongo, and J. O. Ochwach','10th Chuka University Annual International Conference',2023,null,5),
  ('conference','Mathematical modelling of the sterile insect technique for control of false codling moth','J. Ochwach','8th Chuka University Annual International Conference',2021,null,6),
  ('conference','A note on the basic reproduction number: Novel coronavirus (2019-nCoV)','J. Ochwach','Conference presentation',2020,null,7),
  ('conference','Effect of harvesting and stocking under delayed time regulation on the logistic population model','J. Ochwach','Conference presentation',2019,null,8),
  ('conference','Modelling nitrate leaching to groundwater using a modified diffusion advection equation','J. Ochwach','5th Chuka University Annual International Research Conference',2018,null,9)
) as p(kind, title, authors, venue, year, doi, sort_order)
where not exists (select 1 from public.publications existing where existing.kind = p.kind and existing.title = p.title);
