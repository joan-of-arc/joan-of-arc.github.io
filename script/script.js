class Cell 
{
    constructor() 
    {
        for (let i = 0; i < 2; i++) 
        {
            content[i] = [];
            for (let j = 0; j < 6; j++) 
            {
                content[i][j] = 0;
            }
        }
    }
}

function createBoard() 
{
    const board = document.getElementById('board');
    matrix.forEach((row, i) =>
    { 
        const tr = document.createElement('tr');
        row.forEach((cell, j) => 
        {
            td = document.createElement('td');
            td.classList.add('cell');
            tr.appendChild(td);
        })
        board.appendChild(tr);
    });
}