import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import supabase from './supabase.js'
import { chooseModel } from './router.js'
import { callOpenAIModel } from './models/openaiModel.js';

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.post('/chat', async (req, res) => {
  try {
    const { session_id, message } = req.body;

    let sessionId = session_id;

    // 1️⃣ Create session if needed
    if (!sessionId) {
      const { data, error } = await supabase
        .from('sessions')
        .insert({})
        .select();

      if (error) throw error;
      sessionId = data[0].id;
    }

    // 2️⃣ Store user message
    await supabase.from('messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message
    });

    // 3️⃣ Fetch full conversation history
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    // 4️⃣ Choose model (random for now)
    const chosenModel = chooseModel();

    // 5️⃣ Log routing
    await supabase.from('routing_logs').insert({
      session_id: sessionId,
      chosen_model: chosenModel,
      decision_source: 'random'
    });

    // 6️⃣ Call OpenAI
    const reply = await callOpenAIModel(chosenModel, history);

    // 7️⃣ Store assistant message
    await supabase.from('messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: reply,
      model_used: chosenModel
    });

    // 8️⃣ Return response
    res.json({
      session_id: sessionId,
      reply,
      model_used: chosenModel
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})