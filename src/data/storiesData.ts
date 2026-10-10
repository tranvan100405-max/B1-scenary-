import { ReadingStory } from '../types';

export const READING_STORIES: ReadingStory[] = [
  {
    id: 'story_cafe',
    title: 'A Sunny Morning at the Green Cafe',
    level: 'A1',
    topic: 'Daily Life & Food',
    readTime: '2 min read',
    summary: 'Join Mia as she orders her morning breakfast and coffee on a bright sunny day.',
    vietnameseSummary: 'Cùng Mia thưởng thức bữa sáng và cà phê trong một buổi sáng đầy nắng tươi đẹp.',
    content: `Every Saturday morning, Mia visits her favorite neighborhood spot, the Green Cafe. Today the weather is wonderfully bright and warm.

She sits near the window and smiles at a friendly waiter. "Good morning! Can I order a hot coffee and a healthy breakfast of scrambled eggs and toast?" she asks politely.

The food arrives quickly. The aroma of freshly brewed coffee fills the air. A good friend walks in and waves enthusiastically from across the room. Sharing a quiet morning meal together makes them both feel very happy. It is the perfect start to a relaxing weekend.`,
    targetWordIds: ['w_coffee', 'w_breakfast', 'w_weather', 'w_friend', 'w_happy'],
    questions: [
      {
        question: 'What does Mia order for breakfast at the cafe?',
        options: ['Pancakes and iced tea', 'Hot coffee and eggs with toast', 'A bowl of noodle soup', 'Only a glass of water'],
        correctIndex: 1,
        explanation: 'Mia orders a hot coffee and a healthy breakfast of scrambled eggs and toast.',
      },
      {
        question: 'How is the weather described in the story?',
        options: ['Rainy and cold', 'Windy and stormy', 'Wonderfully bright and warm', 'Foggy and dark'],
        correctIndex: 2,
        explanation: 'The story mentions that the weather is wonderfully bright and warm.',
      },
      {
        question: 'Who walks into the cafe and waves at Mia?',
        options: ['Her school teacher', 'A good friend', 'Her taxi driver', 'The cafe manager'],
        correctIndex: 1,
        explanation: 'A good friend walks in and waves enthusiastically from across the room.',
      },
    ],
  },
  {
    id: 'story_market',
    title: 'The Weekend Market Adventure',
    level: 'A2',
    topic: 'Travel & Exploration',
    readTime: '3 min read',
    summary: 'Leo and his sister explore the lively artisan market to find fresh fruit and local treasures.',
    vietnameseSummary: 'Leo và em gái cùng nhau khám phá khu chợ thủ công nhộn nhịp vào cuối tuần.',
    content: `On Sunday, Leo decided to take his bicycle and explore the vibrant weekend market downtown. The market was filled with colorful stalls and lively music.

Leo was naturally curious about the handmade wooden crafts. The stall owner was very patient, explaining how each wooden bowl was carefully carved. In the food alley, the vendors offered delicious samples of warm bread and sweet honeydew melons.

"Going on this market trip feels like a real adventure," Leo told his sister. He bought a small basket of ripe strawberries for their family. Building a good habit of supporting local community artisans brought a proud smile to his face. Their journey back home was filled with cheerful conversation.`,
    targetWordIds: ['w_market', 'w_explore', 'w_curious', 'w_patient', 'w_delicious', 'w_adventure', 'w_habit', 'w_community', 'w_journey'],
    questions: [
      {
        question: 'What was Leo naturally curious about at the market?',
        options: ['The gold jewelry', 'The handmade wooden crafts', 'The vintage cars', 'The mobile phones'],
        correctIndex: 1,
        explanation: 'The story states that Leo was naturally curious about the handmade wooden crafts.',
      },
      {
        question: 'How was the stall owner described?',
        options: ['Rude and hurried', 'Quiet and sleepy', 'Very patient', 'Bored and tired'],
        correctIndex: 2,
        explanation: 'The stall owner was described as very patient, explaining how each bowl was carved.',
      },
      {
        question: 'What good habit did Leo appreciate about this trip?',
        options: ['Waking up late', 'Supporting local community artisans', 'Buying plastic toys', 'Riding fast through traffic'],
        correctIndex: 1,
        explanation: 'Leo appreciated the habit of supporting local community artisans.',
      },
    ],
  },
  {
    id: 'story_green_city',
    title: 'The Sustainable City Project',
    level: 'B1',
    topic: 'Nature & Society',
    readTime: '4 min read',
    summary: 'University students cooperate to design a greener, more sustainable urban future.',
    vietnameseSummary: 'Nhóm sinh viên hợp tác thiết kế mô hình đô thị xanh và phát triển bền vững.',
    content: `In their environmental architecture class, Sarah and David were given a special task: create a sustainable design plan for modern urban living. They were eager to accomplish this challenge because preserving the environment was a cause they deeply cared about.

Through close cooperation, they drafted an innovative neighborhood with solar rooftop gardens, clean rainwater recycling, and electric transit lines. Their research led them to fascinating studies on how green parks reduce stress and purify city air.

When presenting to the university committee, Sarah felt calm and confident. "Every city has an immense opportunity to rebuild itself around nature," she asserted. The judges were impressed and decided to recommend their proposal for a regional exhibition.`,
    targetWordIds: ['w_sustainable', 'w_accomplish', 'w_environment', 'w_cooperation', 'w_fascinating', 'w_confident', 'w_opportunity', 'w_recommend'],
    questions: [
      {
        question: 'What was the central goal of Sarah and David’s project?',
        options: ['Building a racing stadium', 'Creating a sustainable design plan for modern urban living', 'Designing a new computer software', 'Selling fast food chains'],
        correctIndex: 1,
        explanation: 'Their task was to create a sustainable design plan for modern urban living.',
      },
      {
        question: 'What fascinating topic did their research uncover?',
        options: ['How to dig deep oil wells', 'How green parks reduce stress and purify city air', 'How to fly private planes', 'How to pave wider highways'],
        correctIndex: 1,
        explanation: 'Their research led to fascinating studies on how green parks reduce stress and purify city air.',
      },
      {
        question: 'What did the university committee decide to do with their proposal?',
        options: ['Reject it immediately', 'Ignore the presentation', 'Recommend it for a regional exhibition', 'Ask them to delete their slides'],
        correctIndex: 2,
        explanation: 'The committee decided to recommend their proposal for a regional exhibition.',
      },
    ],
  },
];
