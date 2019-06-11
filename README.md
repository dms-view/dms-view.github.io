# FP-Influenza-Evolution: Visualization of deep mutational scanning assays

Team members:
* Allison Black
* Sarah Hilton
* John Huddleston
* Khrystyna North

Project page: https://cse512-19s.github.io/FP-Influenza-Evolution/

Poster: [Poster Link](/final/poster.pdf)
Paper: [Paper Link](/final/paper.pdf)

### Abstract
One of the fundamental goals of laboratory biologists is to understand the way a process works in a controlled setting, and then see if and/or how that process holds true in nature. As computational and laboratory biologists interested in influenza, we want to understand how flu evolves to escape human immunity, a process that means that the flu vaccine needs to be updated every few years. New experimental approaches have allowed us to make and view the effect of every possible amino acid mutation to the HA gene, one of the primary immune targets of the virus. These laboratory assays allow us to infer which sites within the gene are changeable, while allowing the virus to maintain its ability to infect cells, as well as which sites change in order to evade the immune system. While these data are valuable, they are not intuitive to interpret, and without effective systems for visualizing these data, it\textquotesingle s challenging to look for patterns in terms of which types of mutations, in which parts of the protein, matter for both protein function and immune escape. In addition, there are no current platforms that pull together this lab data with data about what types of mutations occur and circulate in nature, which means that researchers are often left unsure of the utility of these data for describing real world flu dynamics. For this project, we propose to build a visualization that fills this gap. Our tool will integrate both lab assay and natural influenza data, showing in an interactive and site-specific manner where these mutations are on the influenza protein structure, and also what types of patterns observed in the lab are also observed in nature.


### Breakdown of work and commentary on the research/development process:

The work for the project was distributed equally among all members of the team. The initial sketch and design of the project was done by Aliie, John and Sarah (members of the team studying virus, vaccines and evolution.) Khrystyna made the first prototype of the webpage design. Allie and Sarah made the line/area plots showing "Absolute differential seleciton" from the lab. John made the frequency plot of the corresponding amino acid frequencies in nature and Khrystyna linked the data from the plots to the protein structure with associated color key. The final editing and formatting of all the plots and the webpage was done by all team memebers. 

As described in the paper and project page this visualization is directly relevant to the work done in labs studying virus evolution in the lab and in nature. Mambers of Sarah's lab generate data shown in the visualizaiton here but have never had a good tool to view all the relevant data at the same time without needing to use multiple programs and have programming experience. The previous method of analysis was both time consuming as well as prohibitive for anyone without a strong programming background. Furthermore, it resulted in the publication of static images in papers which can be hard to fully interpret by readers. We wanted to make a tool that would not only help researchers explore their and learn from their data faster but also help them share the data with other scientists. 

We approached this problem by surveying people working directly with the data to find out what they were most interested in having in a tool. We then planned out the visualizaiton on paper and then split up the components among us. Initally we were leaning towards using Vega but after talking to Jeff at office hours we decided to use D3 to make it easier to integrate standard plots with the 3d structure.  None of us had experience with D3 and most of us had relatively little experience with javascript so having each of us become an "expert" in one componenet and teach the others was exteremely helpful for both meeting the deadlines and learning how to make multiple different plots. Once we each had working prototypes of our components we weorked together to modify each visualization to meet the needs of our users. In additon designing the visualizaion and making the plots we also thought a lot about additional components that we would like to include later such as giving the user the option to color multiple residues at the same time, uploading a custom dataset and protein structure as well as changing the appearance/zoom of teh 3D visualization. Sarah also put some time into creating a pipeline to standardize the lab data more easilty/programatically for the fulture. For simplicity of the demo,and since we only access to one dataset, we decided to not include these in the current visualization but will enble them for future use when we have more feedback from our target audiance. 



