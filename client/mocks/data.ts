export const mockIdeas = [
  {
    id: "idea-1",
    title: "AI-powered personal fitness coach",
    description:
      "An AI coach that learns your fitness preferences and adapts workouts in real-time. The system uses computer vision to track form, provides real-time feedback, and adjusts difficulty based on performance. It also integrates with wearables to monitor heart rate, sleep, and recovery metrics.",
    avgRating: 8.2,
    responseCount: 42,
    createdAt: "2024-01-15",
    isPrivate: false,
    createdBy: "Alex",
    status: "active",
  },
  {
    id: "idea-2",
    title: "Sustainable packaging solutions",
    description:
      "Biodegradable packaging made from agricultural waste products. Our innovative process converts crop residue into sturdy, cost-effective packaging materials that fully decompose within 90 days.",
    avgRating: 7.8,
    responseCount: 28,
    createdAt: "2024-01-20",
    isPrivate: false,
    createdBy: "Jordan",
    status: "active",
  },
  {
    id: "idea-3",
    title: "Community skill-sharing platform",
    description:
      "Connect people to learn and teach skills in your local community. From cooking to coding, photography to plumbing - find experts and learners near you.",
    avgRating: 8.5,
    responseCount: 56,
    createdAt: "2024-01-10",
    isPrivate: false,
    createdBy: "Sam",
    status: "active",
  },
  {
    id: "idea-4",
    title: "Mental health support app",
    description:
      "Anonymous peer support groups for mental wellness. Connect with others who understand, share experiences, and grow together in a safe, moderated environment.",
    avgRating: 8.9,
    responseCount: 73,
    createdAt: "2024-01-05",
    isPrivate: false,
    createdBy: "Casey",
    status: "active",
  },
  {
    id: "idea-5",
    title: "Local food delivery service",
    description:
      "Support local restaurants with sustainable delivery options. We partner with neighborhood restaurants to bring fresh food to your door while supporting small businesses.",
    avgRating: 7.4,
    responseCount: 31,
    createdAt: "2024-01-25",
    isPrivate: false,
    createdBy: "Morgan",
    status: "active",
  },
  {
    id: "idea-6",
    title: "Remote team building tool",
    description:
      "Innovative games and activities for distributed teams. Strengthen team bonds and improve communication with our unique suite of virtual activities designed for remote work.",
    avgRating: 8.1,
    responseCount: 44,
    createdAt: "2024-01-18",
    isPrivate: false,
    createdBy: "Riley",
    status: "active",
  },
];

export const mockFeedback = [
  {
    id: "feedback-1",
    ideaId: "idea-1",
    rating: 9,
    feedback: "Love this concept! The real-time feedback feature is brilliant.",
    sentiment: "positive",
    createdAt: "2024-02-20",
  },
  {
    id: "feedback-2",
    ideaId: "idea-1",
    rating: 8,
    feedback: "Great idea but needs better integration with Apple Watch.",
    sentiment: "positive",
    createdAt: "2024-02-19",
  },
  {
    id: "feedback-3",
    ideaId: "idea-1",
    rating: 7,
    feedback: "Would love to see offline mode for workouts without internet.",
    sentiment: "neutral",
    createdAt: "2024-02-18",
  },
  {
    id: "feedback-4",
    ideaId: "idea-1",
    rating: 8,
    feedback: "The AI personalization is impressive. Very promising product.",
    sentiment: "positive",
    createdAt: "2024-02-17",
  },
  {
    id: "feedback-5",
    ideaId: "idea-1",
    rating: 9,
    feedback: "This could replace my current fitness app. Seriously impressed.",
    sentiment: "positive",
    createdAt: "2024-02-16",
  },
  {
    id: "feedback-6",
    ideaId: "idea-1",
    rating: 7,
    feedback:
      "Privacy concerns around computer vision analysis need to be addressed.",
    sentiment: "neutral",
    createdAt: "2024-02-15",
  },
];

export const mockDashboard = {
  idea: {
    id: "idea-1",
    title: "AI-powered personal fitness coach",
    description:
      "An AI coach that learns your fitness preferences and adapts workouts in real-time. The system uses computer vision to track form, provides real-time feedback, and adjusts difficulty based on performance.",
    status: "active",
    createdAt: "2024-01-15",
    createdBy: "Alex",
    isPrivate: false,
  },
  analytics: {
    totalFeedback: 42,
    avgRating: 8.2,
    ratingDistribution: [
      { _id: 7, count: 8 },
      { _id: 8, count: 18 },
      { _id: 9, count: 12 },
      { _id: 10, count: 4 },
    ],
    sentimentBreakdown: [
      { _id: "positive", count: 28 },
      { _id: "neutral", count: 10 },
      { _id: "negative", count: 4 },
    ],
    suggestions: [
      {
        text: "Add offline mode so the app works without internet",
        rating: 7,
        createdAt: "2024-02-22",
      },
      {
        text: "Support for group workouts with friends",
        rating: 8,
        createdAt: "2024-02-20",
      },
      {
        text: "Better integration with wearable devices",
        rating: 9,
        createdAt: "2024-02-18",
      },
      {
        text: "Meal planning recommendations based on fitness goals",
        rating: 8,
        createdAt: "2024-02-15",
      },
    ],
    feedbackTimeSeries: [
      { _id: "2024-01-15", count: 2 },
      { _id: "2024-01-20", count: 3 },
      { _id: "2024-01-25", count: 5 },
      { _id: "2024-02-01", count: 8 },
      { _id: "2024-02-08", count: 12 },
      { _id: "2024-02-15", count: 18 },
      { _id: "2024-02-22", count: 42 },
    ],
  },
  feedback: mockFeedback,
};
