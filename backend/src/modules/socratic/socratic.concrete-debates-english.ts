import { ConcreteDebateSeed } from "./socratic.concrete-debates";

export const DOMAIN_CONCRETE_DEBATES_ENGLISH: Record<string, ConcreteDebateSeed[]> = {
  "Unit 1: A healthy lifestyle & Generation gap": [
    {
      question: "Some people claim that 'generation gap occurs only because elderly people refuse to learn modern technology'. Is this view correct or incorrect? Why?",
      sample_answer: "Incorrect. The generation gap arises from deeper differences in social values, historical experiences, lifestyle expectations, and communication habits between generations, not merely technology adoption.",
      topic_hint: "Causes of Generation Gap",
      key_points: ["Social and cultural value differences", "Historical upbringing backgrounds", "Technology is only one minor factor"]
    },
    {
      question: "Is it true that living a healthy lifestyle depends solely on doing strenuous physical exercise every single day? Explain why.",
      sample_answer: "Incorrect. A healthy lifestyle requires a holistic balance of nutritious diet, adequate sleep, mental wellbeing, stress management, and moderate regular physical activity.",
      topic_hint: "Holistic Healthy Lifestyle Components",
      key_points: ["Nutritious balanced diet", "Mental wellbeing and sleep quality", "Physical exercise is one of several pillars"]
    }
  ],
  "Unit 2: Global warming & Preserving heritage": [
    {
      question: "Some argue that preserving tangible cultural heritage (like ancient monuments) is much more important than intangible cultural heritage (such as folk singing and traditional craftsmanship). Do you agree? Why or why not?",
      sample_answer: "Disagree. Both forms are equally vital. Tangible heritage provides historical physical evidence, while intangible heritage carries the spiritual identity, living memories, and community wisdom that give meaning to tangible structures.",
      topic_hint: "Tangible vs. Intangible Cultural Heritage",
      key_points: ["Equal importance of both heritage types", "Intangible heritage embodies living traditions", "Tangible structures lose meaning without living culture"]
    },
    {
      question: "Is it correct to assert that greenhouse gases in Earth's atmosphere should be eliminated completely to prevent global warming? Why?",
      sample_answer: "Incorrect. Natural greenhouse gases are essential because without them, Earth's average temperature would drop to minus 18 degrees Celsius, making life impossible. The problem is excessive human-made emissions causing enhanced greenhouse effect.",
      topic_hint: "Natural vs. Enhanced Greenhouse Effect",
      key_points: ["Natural greenhouse effect sustains life", "Complete elimination leads to freezing temperatures", "Problem is anthropogenic excess emissions"]
    }
  ],
  "Unit 3: Artificial intelligence & The world of work": [
    {
      question: "Some people believe that 'artificial intelligence will soon replace all human workers across every professional field'. Is this statement accurate? Why?",
      sample_answer: "Inaccurate. While AI automates routine repetitive tasks, it lacks human empathy, emotional intelligence, genuine creativity, moral reasoning, and philosophical judgment required in fields like education, healthcare, and leadership.",
      topic_hint: "Human-AI Workplace Collaboration",
      key_points: ["AI replaces routine repetitive tasks", "Human empathy and emotional intelligence irreplaceable", "Future is human-AI collaborative synergy"]
    }
  ]
};
