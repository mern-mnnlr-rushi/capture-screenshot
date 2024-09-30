import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import html2canvas from 'html2canvas';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export const ViewPdf = ({ pdfFile }) => {
    const [pdf, setPdf] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageImage, setPageImage] = useState('');
    const [selection, setSelection] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [screenCapture, setScreenCapture] = useState('');
    const [isSelectable, setIsSelectable] = useState(false);
    const captureRef = useRef(null);

    useEffect(() => {
        const loadPdf = async () => {
            const loadedPdf = await pdfjsLib.getDocument(pdfFile).promise;
            setPdf(loadedPdf);
            setTotalPages(loadedPdf.numPages);
            renderPage(loadedPdf, currentPage);
        };

        loadPdf();
    }, [pdfFile]);

    const renderPage = async (pdf, pageNumber) => {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        const imgData = canvas.toDataURL();
        setPageImage(imgData);
    };

    const handleMouseDown = (e) => {
        if (!isSelectable) return;

        const rect = captureRef.current.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;

        const onMouseMove = (moveEvent) => {
            const width = moveEvent.clientX - rect.left - startX;
            const height = moveEvent.clientY - rect.top - startY;
            setSelection({
                startX,
                startY,
                width: Math.max(0, width),
                height: Math.max(0, height),
            });
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            setIsCapturing(false);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        setIsCapturing(true);
    };

    const handleCaptureStart = () => {
        setIsSelectable(true);
        setSelection(null);
        setIsCapturing(true);
    };

    const handleShowCapture = async () => {
        setSelection(null);
        if (selection) {
            const canvas = await html2canvas(captureRef.current, {
                x: selection.startX,
                y: selection.startY,
                width: selection.width,
                height: selection.height,
                scale: window.devicePixelRatio,
                backgroundColor: null,
            });
            const imgData = canvas.toDataURL();
            setScreenCapture(imgData);
            console.log(imgData)
            setIsSelectable(false); // Prevent further selection after capture
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
            renderPage(pdf, currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
            renderPage(pdf, currentPage - 1);
        }
    };

    return (
        <div className='px-5 bg-slate-100 flex flex-col items-center justify-center'>
            <div>
                <button
                    onClick={handleCaptureStart}
                    className="bg-gray-200 p-2 rounded-md mr-5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24"><path fill="black" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V6H4zm3-2h10q.425 0 .713-.288T18 15V9q0-.425-.288-.712T17 8H7q-.425 0-.712.288T6 9v6q0 .425.288.713T7 16m-3 2V6z" /></svg>
                </button>

                <button
                    onClick={handleShowCapture}
                    className="bg-gray-200 p-2 rounded-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 2048 2048"><path fill="black" d="M1664 1024V896h128v128zm0-1024v128h-128V0zm256 1152h-128v-128h128zM1408 0v128h-128V0zm-256 1024V896h128v128zM896 0v128H768V0zm512 1024V896h128v128zm512-256v128h-128V768zm-896 128v128H896V896zm0-256v128H896V640zm0-256v128H896V384zM1152 0v128h-128V0zm768 512v128h-128V512zM896 1255v-103h128v26q-67 33-128 77m1024-999v128h-128V256zm0-256v128h-128V0zM0 1408v-128h128v128zm0 256v-128h128v128zm0-512v-128h128v128zm256-256v128H128V896zM0 768h128v128H0zm256 1152v-128h128v128zm256 0v-128h128v128zm0-1024v128H384V896zM640 0v128H512V0zM384 0v128H256V0zm640 256H896V128h128zM768 896v128H640V896zM128 0v128H0V0zM0 1920v-128h128v128zM128 512v128H0V512zm0-256v128H0V256zm1920 1536h-128q0-66-21-122t-59-103t-87-82t-107-60t-118-36t-120-13q-59 0-120 12t-118 37t-106 59t-87 82t-59 103t-22 123H768q0-84 26-157t71-133t107-108t133-79t148-50t155-17q77 0 154 17t149 49t132 80t107 107t72 134t26 157m-640-256q53 0 100 20t81 54t55 82t20 100q0 53-20 100t-54 81t-82 55t-100 20q-53 0-100-20t-81-54t-55-82t-20-100q0-53 20-100t54-81t82-55t100-20m0 384q26 0 49-10t41-27t28-41t10-50t-10-49t-27-41t-41-28t-50-10t-49 10t-41 27t-28 41t-10 50t10 49t27 41t41 28t50 10" /></svg>
                </button>
            </div>

            <div className='flex flex-row items-center justify-between'>
                <div className='m-5'>
                    <div
                        ref={captureRef}
                        className="relative mt-4 flex justify-center items-center"
                        onMouseDown={handleMouseDown}
                        style={{ cursor: isCapturing ? 'crosshair' : 'default' }}
                    >
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className={`bg-gray-500 text-white p-2 rounded-md mx-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Previous Page
                        </button>

                        <img src={pageImage} alt={`PDF page ${currentPage}`} onDragStart={(e) => e.preventDefault()} className="rounded-md h-[900px] w-[700px]" />

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`bg-gray-500 text-white p-2 rounded-md mx-2 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Next Page
                        </button>
                        {selection && (
                            <div
                                style={{
                                    position: 'absolute',
                                    border: '2px dashed blue',
                                    left: selection.startX,
                                    top: selection.startY,
                                    width: selection.width,
                                    height: selection.height,
                                    pointerEvents: 'none',
                                }}
                            />
                        )}
                    </div>
                    <p className="text-center mt-4">
                        Page {currentPage} of {totalPages}
                    </p>
                </div>

                <div className="m-5">
                    {screenCapture && (
                        <div className="text-center mt-4">
                            <img
                                src={screenCapture}
                                alt="screen-capture"
                                className="rounded-md"
                            />
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
