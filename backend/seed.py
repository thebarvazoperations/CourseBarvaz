"""Seed the database with 25 sample U.S. Constitution questions."""

from database import Base, SessionLocal, engine
from models import Question

QUESTIONS = [
    # ── Amendments (10) ─────────────────────────────────────────────────────
    {
        "question_text": "Which amendment guarantees freedom of speech, religion, and the press?",
        "opt_a": "First Amendment",
        "opt_b": "Second Amendment",
        "opt_c": "Fourth Amendment",
        "opt_d": "Tenth Amendment",
        "correct_ans": "A",
        "category": "amendments",
        "difficulty": 1,
    },
    {
        "question_text": "The Second Amendment protects the right to:",
        "opt_a": "Free speech",
        "opt_b": "Keep and bear arms",
        "opt_c": "A speedy trial",
        "opt_d": "Vote regardless of race",
        "correct_ans": "B",
        "category": "amendments",
        "difficulty": 1,
    },
    {
        "question_text": "Which amendment abolished slavery in the United States?",
        "opt_a": "Twelfth Amendment",
        "opt_b": "Thirteenth Amendment",
        "opt_c": "Fourteenth Amendment",
        "opt_d": "Fifteenth Amendment",
        "correct_ans": "B",
        "category": "amendments",
        "difficulty": 1,
    },
    {
        "question_text": "The Fourth Amendment protects against:",
        "opt_a": "Self-incrimination",
        "opt_b": "Cruel and unusual punishment",
        "opt_c": "Unreasonable searches and seizures",
        "opt_d": "Quartering of soldiers",
        "correct_ans": "C",
        "category": "amendments",
        "difficulty": 2,
    },
    {
        "question_text": "Which amendment granted women the right to vote?",
        "opt_a": "Fifteenth Amendment",
        "opt_b": "Eighteenth Amendment",
        "opt_c": "Nineteenth Amendment",
        "opt_d": "Twenty-first Amendment",
        "correct_ans": "C",
        "category": "amendments",
        "difficulty": 1,
    },
    {
        "question_text": "The Fifth Amendment includes protection against:",
        "opt_a": "Excessive bail",
        "opt_b": "Double jeopardy",
        "opt_c": "Unreasonable searches",
        "opt_d": "Cruel punishment",
        "correct_ans": "B",
        "category": "amendments",
        "difficulty": 2,
    },
    {
        "question_text": "Which amendment lowered the voting age to 18?",
        "opt_a": "Twenty-fourth Amendment",
        "opt_b": "Twenty-fifth Amendment",
        "opt_c": "Twenty-sixth Amendment",
        "opt_d": "Twenty-seventh Amendment",
        "correct_ans": "C",
        "category": "amendments",
        "difficulty": 2,
    },
    {
        "question_text": "The Eighth Amendment prohibits:",
        "opt_a": "Unreasonable searches",
        "opt_b": "Cruel and unusual punishment",
        "opt_c": "Forced self-incrimination",
        "opt_d": "Denial of counsel",
        "correct_ans": "B",
        "category": "amendments",
        "difficulty": 1,
    },
    {
        "question_text": "Which amendment repealed Prohibition?",
        "opt_a": "Eighteenth Amendment",
        "opt_b": "Nineteenth Amendment",
        "opt_c": "Twentieth Amendment",
        "opt_d": "Twenty-first Amendment",
        "correct_ans": "D",
        "category": "amendments",
        "difficulty": 2,
    },
    {
        "question_text": "The Fourteenth Amendment guarantees:",
        "opt_a": "Freedom of the press",
        "opt_b": "Equal protection under the law",
        "opt_c": "Right to bear arms",
        "opt_d": "Abolition of poll taxes",
        "correct_ans": "B",
        "category": "amendments",
        "difficulty": 2,
    },
    # ── Branches of Government (8) ──────────────────────────────────────────
    {
        "question_text": "Which branch of government is responsible for interpreting laws?",
        "opt_a": "Executive",
        "opt_b": "Legislative",
        "opt_c": "Judicial",
        "opt_d": "Administrative",
        "correct_ans": "C",
        "category": "branches",
        "difficulty": 1,
    },
    {
        "question_text": "How many justices serve on the U.S. Supreme Court?",
        "opt_a": "7",
        "opt_b": "9",
        "opt_c": "11",
        "opt_d": "13",
        "correct_ans": "B",
        "category": "branches",
        "difficulty": 1,
    },
    {
        "question_text": "The power to declare war is granted to:",
        "opt_a": "The President",
        "opt_b": "The Supreme Court",
        "opt_c": "Congress",
        "opt_d": "The Secretary of Defense",
        "correct_ans": "C",
        "category": "branches",
        "difficulty": 2,
    },
    {
        "question_text": "Which article of the Constitution establishes the executive branch?",
        "opt_a": "Article I",
        "opt_b": "Article II",
        "opt_c": "Article III",
        "opt_d": "Article IV",
        "correct_ans": "B",
        "category": "branches",
        "difficulty": 2,
    },
    {
        "question_text": "The President's cabinet members must be confirmed by:",
        "opt_a": "The House of Representatives",
        "opt_b": "The Supreme Court",
        "opt_c": "The Senate",
        "opt_d": "The Vice President",
        "correct_ans": "C",
        "category": "branches",
        "difficulty": 2,
    },
    {
        "question_text": "How long is a term for a U.S. Senator?",
        "opt_a": "2 years",
        "opt_b": "4 years",
        "opt_c": "6 years",
        "opt_d": "8 years",
        "correct_ans": "C",
        "category": "branches",
        "difficulty": 1,
    },
    {
        "question_text": "Which body has the sole power to impeach federal officials?",
        "opt_a": "The Senate",
        "opt_b": "The House of Representatives",
        "opt_c": "The Supreme Court",
        "opt_d": "The Department of Justice",
        "correct_ans": "B",
        "category": "branches",
        "difficulty": 2,
    },
    {
        "question_text": "Supreme Court justices serve:",
        "opt_a": "10-year terms",
        "opt_b": "15-year terms",
        "opt_c": "Until age 70",
        "opt_d": "Life terms (during good behavior)",
        "correct_ans": "D",
        "category": "branches",
        "difficulty": 1,
    },
    # ── Civil Rights (7) ────────────────────────────────────────────────────
    {
        "question_text": "Brown v. Board of Education (1954) ruled that:",
        "opt_a": "Prayer in public schools is unconstitutional",
        "opt_b": "Racial segregation in public schools is unconstitutional",
        "opt_c": "Women must be admitted to all public universities",
        "opt_d": "Public schools must provide bilingual education",
        "correct_ans": "B",
        "category": "civil-rights",
        "difficulty": 1,
    },
    {
        "question_text": "The Civil Rights Act of 1964 primarily addressed:",
        "opt_a": "Voting rights for women",
        "opt_b": "Discrimination based on race, color, religion, sex, or national origin",
        "opt_c": "Disability accommodation requirements",
        "opt_d": "Immigration reform",
        "correct_ans": "B",
        "category": "civil-rights",
        "difficulty": 1,
    },
    {
        "question_text": "Which Supreme Court case established the 'separate but equal' doctrine?",
        "opt_a": "Marbury v. Madison",
        "opt_b": "Dred Scott v. Sandford",
        "opt_c": "Plessy v. Ferguson",
        "opt_d": "Brown v. Board of Education",
        "correct_ans": "C",
        "category": "civil-rights",
        "difficulty": 2,
    },
    {
        "question_text": "The Voting Rights Act of 1965 was designed to:",
        "opt_a": "Lower the voting age to 18",
        "opt_b": "Eliminate discriminatory voting practices like literacy tests",
        "opt_c": "Establish the Electoral College",
        "opt_d": "Allow non-citizens to vote in local elections",
        "correct_ans": "B",
        "category": "civil-rights",
        "difficulty": 2,
    },
    {
        "question_text": "Miranda v. Arizona (1966) established the requirement for:",
        "opt_a": "Right to an attorney during trial",
        "opt_b": "Informing suspects of their rights before interrogation",
        "opt_c": "Jury trials for all criminal cases",
        "opt_d": "Prohibition of excessive bail",
        "correct_ans": "B",
        "category": "civil-rights",
        "difficulty": 2,
    },
    {
        "question_text": "Gideon v. Wainwright (1963) established the right to:",
        "opt_a": "Remain silent",
        "opt_b": "A speedy trial",
        "opt_c": "An attorney for defendants who cannot afford one",
        "opt_d": "Trial by jury",
        "correct_ans": "C",
        "category": "civil-rights",
        "difficulty": 3,
    },
    {
        "question_text": "The Americans with Disabilities Act (ADA) was signed into law in:",
        "opt_a": "1975",
        "opt_b": "1980",
        "opt_c": "1990",
        "opt_d": "2000",
        "correct_ans": "C",
        "category": "civil-rights",
        "difficulty": 3,
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_count = db.query(Question).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} questions. Skipping seed.")
            return

        for q_data in QUESTIONS:
            db.add(Question(**q_data))
        db.commit()
        print(f"Seeded {len(QUESTIONS)} questions successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
