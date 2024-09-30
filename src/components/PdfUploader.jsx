import React, { useState } from 'react'
import { ViewPdf } from './ViewPdf.jsx'

export const PdfUploader = () => {

    const [pdf, setPdf] = useState(null)

    const handlePdfShow = (e) => {
        const file = e.target.files[0]
        if (file && file.type === "application/pdf") {
            const fileURL = URL.createObjectURL(file)
            setPdf(fileURL)
        } else {
            alert("Please select a PDF file")
        }
    }
    console.log(pdf)

    return (
        <>
            <div className="bg-slate-100 px-5 py-52 m-10 rounded-xl border-black border-2 flex items-center justify-center">
                <input accept="application/pdf" type="file" onChange={handlePdfShow} />
            </div>
            <div className="flex justify-center">
                {pdf && <ViewPdf pdfFile={pdf} />}
            </div>
        </>

    )
}
