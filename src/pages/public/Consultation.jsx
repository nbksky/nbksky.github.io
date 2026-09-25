import { useState } from "react";
import { useSettings } from "../../contexts/SettingsContext";
import { submitConsultation } from "../../api/content";
import { sendConsultationEmail } from "../../api/notify";
import { firebaseReady } from "../../firebase";
import { useSiteImageMeta } from "../../hooks/useSiteImages";
import PageHero from "../../components/public/PageHero";
import "./ContentPage.css";

const initialForm = { name: "", phone: "", email: "", message: "" };

export default function Consultation() {
  const { settings } = useSettings();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const banner = useSiteImageMeta("banner_consultation");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setStatus("sending");
    try {
      await submitConsultation(form);
      await sendConsultationEmail(settings.notifyEmail, form);
      setStatus("done");
      setForm(initialForm);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <>
      <PageHero title="상담 신청하기" subtitle={settings.heroSubtitle} image={banner} />

      <section className="content-body">
        <div className="container" style={{ maxWidth: 640 }}>
          {!firebaseReady && (
            <p className="state-msg" style={{ color: "#c0392b" }}>
              Firebase 설정이 완료되지 않아 상담신청 접수가 저장되지 않습니다. 관리자에게
              문의해주세요.
            </p>
          )}

          {status === "done" ? (
            <p className="state-msg">상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="name">이름</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="phone">연락처</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="email">이메일 (선택)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                />
              </div>
              <div className="form-field">
                <label htmlFor="message">상담 내용</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
                {status === "sending" ? "전송 중..." : "상담 신청하기"}
              </button>
              {status === "error" && (
                <p style={{ color: "#c0392b", marginTop: 14 }}>
                  전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>
              )}
            </form>
          )}

          <div className="content-body__text" style={{ marginTop: 40 }}>
            <p>
              <strong>전화 상담</strong> : {settings.phone}
            </p>
            <p>
              <strong>주소</strong> : {settings.address}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
