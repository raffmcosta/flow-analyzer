export default async function handler(req, res) {
  // Configurar CORS para aceitar requisições do Figma
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder ao preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Só aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Pegar os dados enviados pelo plugin
  const { apiKey, model, prompt } = req.body;

  if (!apiKey || !model || !prompt) {
    return res.status(400).json({ 
      error: 'Faltam parâmetros: apiKey, model ou prompt' 
    });
  }

  try {
    // Fazer a chamada para a API da Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro da Anthropic: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Retornar a resposta da IA
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Erro no proxy:', error);
    return res.status(500).json({ 
      error: error.message || 'Erro desconhecido' 
    });
  }
}