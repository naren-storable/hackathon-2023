import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)

// const openai = new OpenAI({
//   apiKey: "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", // defaults to process.env["OPENAI_API_KEY"]
// });
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Set the runtime to edge for best performance
export const runtime = "edge";

export async function POST(req: Request) {
  const { vibe, bio, mark } = await req.json();
  const promotionalEmailTemplate = `
  Subject Line: "Discover Our Secure Self-Storage Solutions!"
  
  Introduction:
  Hello [Recipient's Name],
  
  At [Your Storage Company], we're excited to introduce you to our secure and convenient self-storage facilities. Whether you need to declutter your home, store business inventory, or protect your valuable belongings, we've got you covered.
  
  Body:
  Our state-of-the-art storage units are designed to meet your storage needs. Here's why you'll love storing with us:
  - [Feature 1]: Climate-controlled units for preserving your items.
  - [Feature 2]: 24/7 surveillance and security for peace of mind.
  - [Feature 3]: Flexible rental terms to fit your schedule.
  
  Don't miss out on the opportunity to make your life more organized and hassle-free. Reserve your storage unit today!
  
  [IMAGE]
  
  Call to Action:
  Click below to explore our storage options and find the perfect unit for you:
  [Button: Explore Units]
  
  Closing:
  Best regards,
  [Your Storage Company]
  `;
  
  const offerEmailTemplate = `
  Subject Line: "Exclusive Offer: Save [Discount]% on Your First Month's Rent!" \n
  
  Introduction:
  Dear [Recipient's Name],
  
  We appreciate your interest in [Your Storage Company]. As a token of our gratitude, we're delighted to offer you an exclusive discount on your first month's rent.
  
  Body:
  - [Discount]% Off Your First Month's Rent!
  - Use Coupon Code: [Coupon Code]
  
  With our top-notch facilities and excellent customer service, you can trust us to provide a secure and hassle-free storage experience.
  
  [IMAGE]
  
  Call to Action:
  Reserve your storage unit today and save [Discount]% on your first month's rent! Simply enter coupon code [Coupon Code] during checkout.
  [Button: Reserve Now]
  
  Closing:
  Sincerely,
  [Your Storage Company]
  `;
  
  const couponCodeEmailTemplate = `
  Subject Line: "Unlock Savings: Use Coupon Code [Coupon Code] Today!"
  
  Introduction:
  Hello [Recipient's Name],
  
  We're thrilled to share an exclusive offer with you. Use coupon code [Coupon Code] to enjoy incredible savings on your storage rental.
  
  Body:
  - [Discount]% Off Your Rental
  - Secure and Accessible Storage Units
  - Convenient Locations
  
  [IMAGE]
  
  Call to Action:
  Don't miss out on this opportunity! Click the button below to reserve your storage unit and apply the coupon code during checkout to unlock your savings.
  [Button: Reserve Now]
  
  Closing:
  Warm regards,
  [Your Storage Company]
  `;

  // Define dynamic data for email
  const dynamicData = {
    Subject: "Introducing Our New Product!",
    "Recipient's Name": "John Doe",
    "Product Name": "Awesome Product",
    "Product Description": "This amazing product will change your life.",
    CTA: "Click here to learn more",
   "Your Storage Company": "India's  Storage",
  };
  // Function to replace placeholders in the email template
function replacePlaceholders(template:any, data:any) {
  for (const placeholder in data) {
    const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
    template = template.replace(regex, data[placeholder]);
  }
  return template;
}
  const emailWithDynamicData = replacePlaceholders(offerEmailTemplate, dynamicData);
 // Ask OpenAI for a streaming completion given the prompt
 const response = await openai.createChatCompletion({
  model: 'gpt-3.5-turbo',
  stream: true,
  messages: [
    {
      role: 'user',
      content: `Generate a  marketing copy based on ${bio}
        Make sure each generated Campaign Copy is less than 400 words, good email campaign size, but should have good data and grammatically correct,  send html template after subject, body and footer also image position and closing characters base them on this context : ${emailWithDynamicData} `,
    },
  ],
});
console.log(response)

  // Generate email content using OpenAI
// function generateEmailContent(template) {
//   openai.completions.create({
//     engine: 'text-davinci-002',
//     prompt: template,
//     max_tokens: 100,
//   })
//     .then((response) => {
//       const generatedContent = response.choices[0].text;

//       // You can save the generated content to a file or send it via email
//       fs.writeFileSync('generated_email.txt', generatedContent);

//       console.log('Email content generated successfully:');
//       console.log(generatedContent);
//     })
//     .catch((error) => {
//       console.error('Error generating email content:', error);
//     });
// }

// Replace placeholders with dynamic data


  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
