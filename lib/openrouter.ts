interface SummarizeResult {
  summary: string;
  keywords: string[];
}

export async function summarizeArticle(
  title: string,
  content: string
): Promise<SummarizeResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return { summary: '', keywords: [] };
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer':
        process.env.NEXT_PUBLIC_APP_URL || 'https://medical-news-agent.vercel.app',
      'X-Title': 'Medical News Agent',
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [
        {
          role: 'system',
          content: `당신은 의료/보건 뉴스 전문 요약가입니다. 다음 영문 의료 뉴스 기사를 한국어로 요약해주세요.

응답은 반드시 아래 JSON 형식으로만 반환하세요:
{"summary": "2-3문장으로 된 한국어 요약", "keywords": ["질병키워드1", "키워드2", "키워드3"]}

규칙:
- summary는 핵심 내용을 한국어 2-3문장으로 작성
- keywords는 질병명, 병원체, 치료법 등 핵심 의료 키워드를 영어로 최대 5개
- JSON 외의 다른 텍스트는 절대 포함하지 마세요`,
        },
        {
          role: 'user',
          content: `제목: ${title}\n\n내용: ${content.slice(0, 3000)}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || '{}';

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw) as SummarizeResult;
    return {
      summary: parsed.summary || '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    };
  } catch {
    return { summary: raw.slice(0, 500), keywords: [] };
  }
}
