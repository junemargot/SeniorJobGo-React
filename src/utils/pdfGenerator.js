import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (resumeData) => {
  const doc = new jsPDF();
  
  // 제목
  doc.setFontSize(24);
  doc.text("이력서", 105, 30, { align: "center" });

  // 개인 정보
  doc.setFontSize(18);
  doc.text("개인 정보", 20, 50);
  doc.setLineWidth(0.5);
  doc.line(20, 53, 190, 53);

  doc.setFontSize(12);
  doc.text(`이름: ${resumeData.name}`, 20, 65);
  doc.text(`연락처: ${resumeData.phone}`, 20, 75);
  if (resumeData.email) {
    doc.text(`이메일: ${resumeData.email}`, 20, 85);
  }

  let yPos = 105;

  // 경력 사항
  if (resumeData.experience?.length) {
    doc.setFontSize(18);
    doc.text("경력", 20, yPos);
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += 20;

    doc.setFontSize(12);
    resumeData.experience.forEach(exp => {
      if (exp.company) {
        // 회사명과 기간
        doc.setFontSize(14);
        doc.text(`${exp.company} - ${exp.position}`, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(12);
        if (exp.period) {
          doc.text(exp.period, 20, yPos);
          yPos += 7;
        }
        
        // 업무 설명
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, 170);
          descLines.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 7;
          });
        }
        yPos += 10;
      }
    });
  }

  // 보유 기술 및 장점
  if (resumeData.skills) {
    yPos += 10;
    doc.setFontSize(18);
    doc.text("보유 기술 및 장점", 20, yPos);
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += 20;

    doc.setFontSize(12);
    const skillLines = doc.splitTextToSize(resumeData.skills, 170);
    skillLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 7;
    });
  }

  // 자기소개서
  if (resumeData.additional_info) {
    yPos += 10;
    doc.setFontSize(18);
    doc.text("자기소개서", 20, yPos);
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += 20;

    doc.setFontSize(12);
    const introLines = doc.splitTextToSize(resumeData.additional_info, 170);
    introLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 7;
    });
  }

  return doc.output('blob');
}; 