const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export async function summarizeArticle(title: string, content: string): Promise<string> {
  const prompt = `다음 의료/건강 뉴스 기사를 한국어로 3-5문장으로 핵심만 요약해주세요.
질병명, 원인, 증상, 예방법, 최신 연구 결과 등 중요 정보를 포함하세요.

제목: ${title}

내용: ${content.slice(0, 3000)}

한국어 요약:`

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://medical-news-agent.vercel.app',
      'X-Title': 'Medical News Agent',
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content?.trim() || '요약을 생성할 수 없습니다.'
}
