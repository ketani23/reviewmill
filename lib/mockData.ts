export type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  drafted_response: string;
  response_status: "pending" | "drafted" | "approved" | "sent" | "responded";
};

export const mockReviews: Review[] = [
  {
    id: "1",
    reviewer_name: "Sarah M.",
    rating: 5,
    review_text:
      "Absolutely incredible pizza! The Margherita was perfectly charred, the dough was light and airy, and the sauce tasted like it was made from grandma's recipe. Staff was warm and attentive. Already planning my next visit!",
    review_date: "2026-02-28",
    drafted_response:
      "Thank you so much, Sarah! We're absolutely thrilled to hear that you loved the Margherita — our dough and sauce are made fresh daily with a lot of love, so your words mean everything to our team. We can't wait to welcome you back for your next visit!",
    response_status: "drafted",
  },
  {
    id: "2",
    reviewer_name: "James K.",
    rating: 5,
    review_text:
      "Tony's is a neighborhood gem. The pasta and garlic bread are out of this world. Brought my whole family for my dad's birthday and they made it really special. Five stars all the way!",
    review_date: "2026-02-25",
    drafted_response:
      "What a wonderful message, James! We're so honored that you chose Tony's to celebrate your dad's birthday — making those moments special is exactly what we're here for. Happy birthday to your dad, and we hope to see the whole family again very soon!",
    response_status: "drafted",
  },
  {
    id: "3",
    reviewer_name: "Priya R.",
    rating: 4,
    review_text:
      "Really tasty pizza and friendly service. The only reason I'm not giving 5 stars is that we waited about 30 minutes for our food on a busy Friday night. Totally understandable but worth mentioning.",
    review_date: "2026-02-22",
    drafted_response:
      "Thank you for the kind words and honest feedback, Priya! We're glad the pizza and service hit the mark. Friday evenings can get quite busy, and we apologize that the wait was longer than expected — we're always working to improve our kitchen flow. We hope to earn that 5th star on your next visit!",
    response_status: "drafted",
  },
  {
    id: "4",
    reviewer_name: "Derek T.",
    rating: 3,
    review_text:
      "The pizza itself was decent but my order came out lukewarm. The restaurant was packed so I get it, but when you're paying these prices you want hot food. The staff apologized which was nice.",
    review_date: "2026-02-18",
    drafted_response:
      "Hi Derek, thank you for sharing your experience. We're sorry your pizza didn't arrive at the right temperature — that's not the standard we hold ourselves to, and we appreciate your patience. We'd love the chance to make it up to you. Please reach out to us at hello@tonyspizzeria.com and we'll make sure your next visit is much better!",
    response_status: "drafted",
  },
  {
    id: "5",
    reviewer_name: "Megan L.",
    rating: 2,
    review_text:
      "Disappointing experience. We waited over an hour for our food, and when it finally arrived one of the pizzas was wrong. The manager didn't offer any compensation, just an apology. Won't be back.",
    review_date: "2026-02-14",
    drafted_response:
      "Hi Megan, we sincerely apologize for the experience you had. A one-hour wait and an incorrect order are completely unacceptable, and we understand your frustration. We're also sorry we didn't do more to make it right in the moment. We'd genuinely like the chance to turn this around — please contact us directly at hello@tonyspizzeria.com and we'll take care of you personally.",
    response_status: "drafted",
  },
  {
    id: "6",
    reviewer_name: "Carlos B.",
    rating: 1,
    review_text:
      "Worst pizza I've ever had. Dough was undercooked, toppings were sparse, and the place smelled like it hadn't been cleaned in days. Absolutely avoid.",
    review_date: "2026-02-10",
    drafted_response:
      "Hi Carlos, we're truly sorry to read this — this is not at all the experience we want for any of our guests, and we take your feedback very seriously. We'll be reviewing our kitchen standards as a result of your review. We understand if you'd prefer not to return, but we'd genuinely like the opportunity to make this right. Please reach out to us at hello@tonyspizzeria.com.",
    response_status: "drafted",
  },
];

export type SimulateTemplate = {
  reviewer_name: string;
  rating: number;
  review_text: string;
};

export const SIMULATE_POOL: SimulateTemplate[] = [
  {
    reviewer_name: "Amanda F.",
    rating: 5,
    review_text:
      "Best pizza I've had in years! The wood-fired crust was perfectly crispy and the fresh basil on top made all the difference. Service was fast and the staff were so friendly. We'll definitely be regulars.",
  },
  {
    reviewer_name: "Maria S.",
    rating: 4,
    review_text:
      "Fantastic food and great atmosphere. The pasta carbonara was creamy and indulgent. Service was a little slow but the staff were friendly and apologetic about it. Would definitely come back.",
  },
  {
    reviewer_name: "Kevin O.",
    rating: 3,
    review_text:
      "Good pizza but nothing mind-blowing. The tiramisu was the highlight of the meal. Portions felt a bit small for the price point. Might give it another shot.",
  },
  {
    reviewer_name: "Nina B.",
    rating: 5,
    review_text:
      "Tony's never disappoints! Third visit and every time the food is consistently amazing. The garlic knots are a must-order. So glad this place is in the neighborhood.",
  },
  {
    reviewer_name: "Ryan M.",
    rating: 2,
    review_text:
      "Had high hopes based on the reviews but was let down. The pizza arrived cold and the crust was soggy. Staff seemed overwhelmed and not very attentive. Probably won't return.",
  },
  {
    reviewer_name: "Aisha T.",
    rating: 5,
    review_text:
      "Absolutely phenomenal! The Sicilian slice was perfectly crispy on the outside, perfectly chewy inside. The owner personally came by to check on us — that personal touch is rare these days.",
  },
  {
    reviewer_name: "Tom H.",
    rating: 1,
    review_text:
      "Very disappointing. Waited 45 minutes for a simple order, the pizza was burnt on one side, and nobody seemed to care when I mentioned it. Won't be coming back.",
  },
  {
    reviewer_name: "Lisa K.",
    rating: 4,
    review_text:
      "Really solid spot! The margherita was simple but perfect. A bit pricey for the portion size but the quality justifies it. Will be back for the calzone next time.",
  },
  {
    reviewer_name: "Omar J.",
    rating: 5,
    review_text:
      "Celebrated our anniversary here and it was perfect. The staff surprised us with a complimentary dessert when they heard. The truffle pizza was out of this world. Highly recommend!",
  },
  {
    reviewer_name: "Rachel D.",
    rating: 3,
    review_text:
      "Decent place but a bit inconsistent. First visit was great, second visit the pizza was overcooked. The pasta dishes are more reliable. Atmosphere is lovely though.",
  },
];
