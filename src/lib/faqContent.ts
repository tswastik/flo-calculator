export type FAQItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What counts as a normal cycle length?',
    answer:
      'Most cycles run somewhere between 21 and 35 days, counted from the first day of one period to the day before the next, with 28 days being the commonly cited average. A period itself usually lasts two to seven days. "Normal" varies a lot from person to person, so what matters most is what is typical for you.',
  },
  {
    question: 'Why are my periods irregular?',
    answer:
      'Cycles are considered irregular when they fall outside the 21-35 day range, or when the gap between cycles swings by more than about a week from month to month. Common causes include stress, big changes in weight or exercise, thyroid issues, polycystic ovary syndrome (PCOS), breastfeeding, and perimenopause. Occasional variation is normal; a doctor can help if it keeps happening.',
  },
  {
    question: 'What are the follicular and luteal phases?',
    answer:
      'The follicular phase runs from the first day of your period until ovulation, and varies the most in length from person to person. The luteal phase runs from ovulation to the day before your next period, and is usually a fairly steady 12-14 days no matter how long the rest of the cycle is - which is why counting back 14 days from your next expected period gives a reasonable ovulation estimate.',
  },
  {
    question: 'What are "fertile days"?',
    answer:
      "Your fertile window is the handful of days when pregnancy is possible: roughly the five days before ovulation plus the day of ovulation itself, since sperm can survive a few days inside the body while the egg is only viable for about a day after release.",
  },
  {
    question: 'How accurate is this calculator?',
    answer:
      'This tool estimates dates from the numbers you enter - it does not know about stress, illness, travel, or anything else that can shift a cycle. The more consistent your cycles are, and the more of them you log in History, the more reliable the estimate becomes. Treat every result as a helpful guess, not a guarantee.',
  },
  {
    question: 'Can I use this to avoid or plan a pregnancy?',
    answer:
      'No. This calculator is for general awareness only and is not a form of contraception or a fertility guarantee. If you are trying to conceive or avoid pregnancy, talk to a healthcare provider about reliable methods.',
  },
];
