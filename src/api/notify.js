const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const emailReady = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

// 상담 접수 알림 메일 발송. 실패해도 상담 저장에는 영향이 없도록 예외를 던지지 않고 성공 여부만 반환한다.
export async function sendConsultationEmail(toEmail, consultation) {
  if (!emailReady || !toEmail) return false;
  try {
    const { default: emailjs } = await import("@emailjs/browser");
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: toEmail,
        from_name: consultation.name,
        phone: consultation.phone,
        visitor_email: consultation.email || "(입력 안 함)",
        reply_to: consultation.email || toEmail,
        message: consultation.message || "(내용 없음)",
        created_at: new Date().toLocaleString("ko-KR"),
      },
      { publicKey: PUBLIC_KEY }
    );
    return true;
  } catch (err) {
    console.error("상담 알림 메일 발송 실패", err);
    return false;
  }
}
