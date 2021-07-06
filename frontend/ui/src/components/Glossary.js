import React from 'react';
import './Glossary.css';


const terms = {
    'A': 'Assists',
    'Bonus': 'Bonus points',
    'CS': 'Clean sheets',
    'D': 'Games drawn',
    'difficulty': 'Difficulty of forthcoming games, calculated separately for attackers and defenders',
    'difficulty GF': "Calculated difficulty to play against for a team's attackers. 0 = easy, 10 = hard",
    'difficulty GA': "Calculated difficulty to play against for a team's defenders. 0 = easy, 10 = hard",
    'form mins': 'Recent form of minutes played',
    'form pts': 'Recent form of Points',
    'G': 'Goals',
    'GA': 'Goals against',
    'GC': 'Goals conceded',
    'GF': 'Goals for',
    'GW': 'Game week',
    'L': 'Games lost',
    'ma(Pts,L)': 'Long (10 weeks) moving average of Points',
    'ma(Pts,S)': 'Short (5 weeks) moving average of Points',
    'ma(GA,L)': 'Long (10 weeks) moving average of Goals Against',
    'ma(GA,S)': 'Short (5 weeks) moving average of Goals Against',
    'ma(GF,L)': 'Long (10 weeks) moving average of Goals For',
    'ma(GF,S)': 'Short (5 weeks) moving average of Goals For',
    'mins': 'Minutes played',
    'mins/(G+A)': 'Average number of minutes players per goal or assist',
    'OG': 'Own goals',
    'P': 'Games played',
    'Pens missed': 'Penalties missed',
    'Pens saved': 'Penalties saved',
    'Price': 'Price £m',
    'Pts': 'Points',
    'Pts deducted': 'Points deducted e.g. for buying more players than your quota for the week',
    'pts/90min': 'Average points per 90 minutes played',
    'RC': 'Red cards',
    'Sub pts': 'Points gained by substitutes',
    'Total pts': 'Total points for the season',
    'Transfers (k)': 'Net transfers for a game week = transfers in - transfers out (000s)',
    'W': 'Games won',
    'YC': 'Yellow cards',
}


const Glossary = () => {
    document.title = 'Fantasy Football Stats | Glossary';

    const get_table_rows = () => Object.keys(terms).map(key => {
        return (
            <tr key={key}>
                <td key={`${key}-term`} className="term-column">{key}</td>
                <td key={`${key}-descrptn`} className="description-column">{terms[key]}</td>
            </tr>
        );
    });

    return (  
        <div className="glossary-container">
            <h3>Glossary</h3>
            <div className="terms-table-container">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Term</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        { get_table_rows() }
                    </tbody>
                </table>
            </div>
        </div>
    );
}
 
export default Glossary;