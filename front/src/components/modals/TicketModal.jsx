import React from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { X } from 'lucide-react'

class TicketModal extends React.Component {
    generatePDF = async () => {
        const element = document.getElementById("ticket")

        const canvas = await html2canvas(element, {
            scale: 2
        })

        const imgData = canvas.toDataURL("image/png")

        const widthPx = canvas.width
        const heightPx = canvas.height

        const pxToMm = (px) => px * 0.264583

        const pdf = new jsPDF({
            orientation: widthPx > heightPx ? "landscape" : "portrait",
            unit: "mm",
            format: [pxToMm(widthPx), pxToMm(heightPx)]
        })

        pdf.addImage(imgData, "PNG", 0, 0, pxToMm(widthPx), pxToMm(heightPx))

        pdf.save("ticket.pdf")
    }

    render() {
        const { passenger, data, from_station, price } = this.props.ticketData

        return (
            <div className="modal-wrapper">
                <div className="ticket-modal">
                    <div className="header">
                        <div className="title">
                            <h2>Квиток</h2>
                        </div>

                        <div className="icon-wrapper close" onClick={() => this.props.setRenderTicketModal(false)}>
                            <X />
                        </div>
                    </div>
                    <div className="body">
                        <div id="ticket" style={{ padding: 20, background: "#fff", width: 750 }}>
                            <div className="ticket-header" style={{ marginBottom: 30 }}>
                                <h2>MY WAY</h2>
                            </div>

                            <div className="ticket-body">
                                <div className="ticket-body-data" style={{ width: 'fit-content' }}>
                                    <p style={{ borderBottom: "1px dashed black", alignItems: "center", display: 'grid', gridTemplateColumns: '150px 1fr' }}><b>Квиток №:</b> <span style={{ color: '#3D4551' }}>123456</span></p>
                                    <p style={{ borderBottom: "1px dashed black", alignItems: "center", display: 'grid', gridTemplateColumns: '150px 1fr' }}><b>Пасажир:</b> <span style={{ color: '#3D4551' }}>{passenger.first_name} {passenger.last_name}</span></p>
                                    <p style={{ borderBottom: "1px dashed black", alignItems: "center", display: 'grid', gridTemplateColumns: '150px 1fr' }}><b>Рейс:</b> <span style={{ color: '#3D4551' }}>{data.from} → {data.to}</span></p>
                                    <p style={{ borderBottom: "1px dashed black", alignItems: "center", display: 'grid', gridTemplateColumns: '150px 1fr' }}><b>Дата:</b> <span style={{ color: '#3D4551' }}>{new Date(data.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'numeric', year: 'numeric' })}</span></p>
                                    <p style={{ borderBottom: "1px dashed black", alignItems: "center", display: 'grid', gridTemplateColumns: '150px 1fr' }}><b>Час:</b> <span style={{ color: '#3D4551' }}>{this.props.formatTimeFromSeconds(data.time)}</span></p>
                                    <p style={{ borderBottom: "1px dashed black", alignItems: "center", display: 'grid', gridTemplateColumns: '150px 1fr' }}><b>Відправлення:</b> <span style={{ color: '#3D4551' }}>{data.from} <span>{data.from_station_name} ({data.from_station_address})</span></span></p>
                                    <p style={{ borderBottom: "1px dashed black", alignItems: "center", display: 'grid', gridTemplateColumns: '150px 1fr' }}><b>Посадка:</b> <span style={{ color: '#3D4551' }}>{from_station.city} <span>{from_station.station} ({from_station.station_address})</span></span></p>
                                    <p style={{ borderBottom: "1px dashed black", alignItems: "center", display: 'grid', gridTemplateColumns: '150px 1fr' }}><b>Прибуття:</b> <span style={{ color: '#3D4551' }}>{data.to} <span>{data.to_station_name} ({data.to_station_address})</span></span></p>
                                </div>

                                <div className="ticket-body-message" style={{ paddingTop: 10, paddingBottom: 10 }}>
                                    <p><b>* Для забезпечення організованої посадки, пасажиру потрібно прибути до місця відправлення за 20 хвилин до вказаного часу відправлення!</b></p>
                                </div>

                                <div className="ticket-body-message" style={{ borderTop: "1px solid gray", borderBottom: "1px solid gray", paddingTop: 10, paddingBottom: 10 }}>
                                    <p>Одна валіза або сумка (50x50x80) до 30кг входить у вартість квитка, за додатковий багаж доплата від 20 зл (розміри, вага) при наявності місця в багажному відділенні. За кожен додатковий 1 кг - 10 UAH / 3 PLN</p>
                                </div>
                            </div>

                            <div className="ticket-footer" style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 50 }}>
                                <div className="ticket-footer-contacts" style={{ textAlign: 'center' }}>
                                    <div style={{ marginBottom: 10 }}>
                                        <b>Ваш персональний менеджер:</b>
                                        <p>MyWay</p>
                                        <p>+38 068 216 1163</p>
                                    </div>

                                    <div>
                                        <b>Менеджер лінії:</b>
                                        <p>MyWay</p>
                                        <p>+38 068 216 1163</p>
                                    </div>
                                </div>

                                <div className="ticket-footer-summary" style={{ width: 'fit-content' }}>
                                    <p style={{ borderBottom: "1px dashed black", display: 'grid', gridTemplateColumns: '200px 1fr' }}><b>Ціна квитка:</b> {price}</p>
                                    <p style={{ borderBottom: "1px dashed black", display: 'grid', gridTemplateColumns: '200px 1fr' }}><b>До оплати при посадці:</b> {price}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer">
                        <button type="button" className="inter-font yes" onClick={this.generatePDF}>Згенерувати PDF</button>
                    </div>
                </div>
            </div >
        )
    }
}

export default TicketModal