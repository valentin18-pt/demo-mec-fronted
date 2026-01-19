import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Importa los íconos
import "./Pagination.css";

const Pagination = ({
    page,
    totalItems,
    rowsPerPage,
    handlePageChange
}) => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const generatePageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (page <= 3) {
                pageNumbers.push(1, 2, 3, '...', totalPages);
            } else if (page > totalPages - 3) {
                pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(1, '...', page - 1, page, page + 1, '...', totalPages);
            }
        }
        return pageNumbers;
    };

    return (
        <div className="pagination-container">
            <button
                className={`pagination-button ${page === 1 ? 'disabled' : ''}`}
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                title="Página anterior" // Añade un tooltip
            >
                <ChevronLeft size={18} /> {/* Ícono para izquierda */}
            </button>
            <span className="page-numbers">
                {generatePageNumbers().map((pageNum, index) => (
                    <button
                        key={index}
                        className={`page-button ${pageNum === page ? 'selected' : ''} ${pageNum === '...' ? 'ellipsis' : ''}`}
                        onClick={() => {
                            if (pageNum !== '...') {
                                handlePageChange(pageNum);
                            }
                        }}
                        disabled={pageNum === '...'} // Deshabilita los puntos suspensivos
                    >
                        {pageNum}
                    </button>
                ))}
            </span>
            <button
                className={`pagination-button ${page === totalPages ? 'disabled' : ''}`}
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                title="Siguiente página" // Añade un tooltip
            >
                <ChevronRight size={18} /> {/* Ícono para derecha */}
            </button>
        </div>
    );
};

export default Pagination;