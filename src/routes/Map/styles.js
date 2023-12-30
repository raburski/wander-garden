export default function getStyles(countryCodes, theme) {
    const countryStyles = countryCodes.map(cc => `
    #worldmap #${cc.toLowerCase()} { fill: ${theme.map.active.default}; cursor: pointer; }
    #worldmap #${cc.toLowerCase()}:hover { fill: ${theme.map.active.highlight}; }
    #worldmap #${cc.toLowerCase()} path { fill: ${theme.map.active.default}; cursor: pointer; }
    #worldmap #${cc.toLowerCase()} path:hover { fill: ${theme.map.active.highlight}; }
    `).join('')

    const mapStyles = `/*
   /*
    * Circles around small countries and territories
    *
    * Change opacity to 1 to display all circles
    */
    .circlexx
    {
      opacity: 0;
      fill: #c0c0c0;
      stroke: #000000;
      stroke-width: 0.5;
    }
    
    /*
     * Smaller circles around subnational territories: Australian external territories, Chinese SARs, Dutch special municipalities, and French DOMs (overseas regions/departments) [but not French COMs (overseas collectivities)]
     *
     * Change opacity to 1 to display all circles
     */
    .subxx
    {
      opacity: 0;
      fill: #c0c0c0;
      stroke: #000000;
      stroke-width: 0.3;
    }
    
    
    /*
     * Land
     * (all land, as opposed to water, should belong to this class; in order to modify the coastline for land pieces with no borders on them a special class "coastxx" has been added below)
     */
    .landxx
    {
      fill: ${theme.map.normal.default};
      stroke: ${theme.map.border};
      stroke-width: 1;
      fill-rule: evenodd;
      cursor: pointer;
    }
    
    .landxx:hover {
     fill: ${theme.map.normal.highlight};
    }
    /*
     * Styles for coastlines of islands and continents with no borders on them
     * (all of them should also belong to the class "landxx" - to allow for all land to be modified at once by refining "landxx" style's definition further down)
     */
    .coastxx
    {
      stroke-width: 0.5;
    }
    
    
    /*
     * Styles for territories without permanent population (the largest of which is Antarctica)
     *
     * Change opacity to 0 to hide all territories
     */
    .antxx
    {
      opacity: 1;
      fill: ${theme.map.normal.default};
      stroke: ${theme.map.border};
      stroke-width: 1;
    }
    
    /*
     * Circles around small countries without permanent population
     *
     * Change opacity to 1 to display all circles
     */
    .noxx
    {
      opacity: 1;
      fill: ${theme.map.normal.default};
      stroke: ${theme.map.border};
      stroke-width: 1;
    }
    
    
    /*
     * Styles for territories with limited or no recognition
     * (all of them - including Taiwan - are overlays (i.e. duplicate layers) over their "host" countries, and so not showing them doesn't leave any gaps on the map)
     *
     * Change opacity to 1 to display all territories
     */
    .limitxx
    {
      opacity: 0;
      fill: #c0c0c0;
      stroke: #ffffff;
      stroke-width: 0.2;
      fill-rule: evenodd;
    }
    
    /*
     * Smaller circles around small territories with limited or no recognition
     *
     * Change opacity to 1 to display all circles
     */
    .unxx
    {
      opacity: 0;
      fill: #c0c0c0;
      stroke: #000000;
      stroke-width: 0.3;
    }`

    return `${countryStyles} ${mapStyles}`
}