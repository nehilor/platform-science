# Coding Exercise

The following problem was assigned as a coding exercise to evaluate problem-solving skills and coding practices for candidates seeking a developer role. The solution to the problem and how it is approached serve as the basis for discussion during interview sessions. The evaluation of the solution will consider such things as:

- Code organization
- Code readability
- Quality of instructions

## Problem Statement

Our sales team has just struck a deal with Acme Inc to become the exclusive provider for routing their product shipments via 3rd party trucking fleets. The catch is that we can only route one shipment to one driver per day.

Each day we get the list of shipment destinations that are available for us to offer to drivers in our network. Fortunately our team of highly trained data scientists have developed a mathematical model for determining which drivers are best suited to deliver each shipment.

With that hard work done, now all we have to do is implement a program that assigns each shipment destination to a given driver while maximizing the total suitability of all shipments to all drivers.

The top-secret algorithm is:

- If the length of the shipment's destination street name is even, the base suitability score (SS) is the number of vowels in the driver’s name multiplied by 1.5.
- If the length of the shipment's destination street name is odd, the base SS is the number of consonants in the driver’s name multiplied by 1.
- If the length of the shipment's destination street name shares any common factors (besides 1) with the length of the driver’s name, the SS is increased by 50% above the base SS.

Write an application in the language of your choice that assigns shipment destinations to drivers in a way that maximizes the total SS over the set of drivers. Each driver can only have one shipment and each shipment can only be offered to one driver. 

Your program should run on the command line and take as input two newline separated files, the first containing the street addresses of the shipment destinations and the second containing the names of the drivers.

The output should be the total SS and a matching between shipment destinations and drivers. You do not need to worry about malformed input, but you should certainly handle both upper and lower case names.

## Analysis

Based on the requirements outlined in the problem statement, it is identified to be within a class of combinatorial optimization problems known as an [assignment problem](https://en.wikipedia.org/wiki/Assignment_problem). The structure of the problem consists of a set of agents that can be assigned to a set of tasks. Each possible assignment has an associated cost. The goal is to make assignments such that all tasks are assigned to an agent and that the total cost of those assignments is the least cost. 

In the formulation given in the problem statement, the agents are the drivers and the tasks are the shipments/destinations. The additional constraint that one driver can be assigned to at most one destination, and one destination can be assigned to at most one driver, makes it a particular type of assignment problem known as a balanced assignment. It is also noted that the goal, as stated, is framed as a maximization, where the total suitability score must be maximized. However, the problem can be reframed as a minimization problem by transforming the suitability scores into cost scores by subtracting all the suitability scores from an arbitrarily large number. This number can be any number outside the expected range of scores (i.e. must be larger than largest expected value). Since the minimization of this difference has the same effect as the maximization of the original scores, the assignments selected for minimization will be the same as those selected for maximization, thereby achieving the intended goal.

Online research found these well-known methods for solving the minimization problem. There were others, but these were the most prominent:

- Complete enumeration method
  - Brute-force approach that enumerates every possible combination of assignments and their associated costs/rewards and then selects the optimal combinations based on the optimization goal (i.e. cost minimization or reward maximization). This method doesn't scale well as the number of agents and tasks grows (time complexity of O(n!))
- Simplex method
  - Linear programming approach where an objective function that represents a cost or reward, and a set of constraints bound the solution space. The vertices of the bound space form the set of feasible solutions, which are then searched for the optimal solution.
- Hungarian (Kuhn-Munkres) method
  - Utilizes an n x n square matrix where the rows represent agents and the columns represent tasks. Each entry in the matrix corresponds to a cost associated with that agent/task pairing. The process involves successively reducing entry values to zeros in order to easily identify eligible assignments. The key insight is the fact that adding or subtracting a fixed number from all entries in any one row or column results in a cost matrix that has an optimal assignment which is the same as the original matrix. The steps are as follows:
  
  1. For each row of the matrix, find the smallest element and subtract it from every element in its row.
  2. Do the same (as step 1) for all columns.
  3. Cover all zeros in the matrix using minimum number of horizontal and vertical lines.
  4. Test for Optimality: If the minimum number of covering lines is n, an optimal assignment is possible. Select the zeros that are the only ones in its respective row and column. These selections are the final assignments and the process is complete. Else if lines are less than n, we haven’t found the optimal assignment, and must proceed to step 5.
  5. Determine the smallest entry not covered by any line. Subtract this entry from each uncovered row, and then add it to each covered column. Return to step 3.

Of the three, the Hungarian method provides the most efficient algorithm with time complexity of O(n<sup>3</sup>). 

## Solution

### Assumptions

- The language used in the text is English
- Whitespaces are not significant in the name and address string length counts

### Approach

Having identified both the class of problem and the available methods for solving it, it was determined that the best method to employ was the Hungarian algorithm, due to it's efficiency and availability of an existing package ([munkres-js](https://github.com/addaleax/munkres-js)) that implements it in the chosen language. Since the role being considered for requires proficiency in `node.js`, the selection of `node` as the implementation language was a natural choice.

The solution can be broken down into the following steps:

1. Read the input data files that contain the names of drivers and the addresses of destinations that need to be assigned
2. Take the inputs and construct a reward matrix based on the suitability score algorithm, as well as construct a matrix that pairs all drivers to all tasks where each entry corresponds to an associated entry in the rewards matrix. This correspondence of rewards to driver-to-destination pairings will be used to correspond final assignments based on the rewards matrix to actual driver-to-destination pairings that can be displayed to the user in a human-readable format.
3. Convert the reward matrix into a cost matrix
4. Feed the cost matrix as input to the [munkres-js](https://github.com/addaleax/munkres-js) package to generate the matrix of least-cost assignments
5. Use the least-cost assignments and the reward matrix to produce the total suitability score
6. Map the least-cost assignment matrix to driver/destination pairs associated with the assignments
7. Display the results

### Deliverables

- The full source code, including any code written which is not part of the normal program run (e.g. build scripts)
- Clear instructions on how to build/run the app

### Installation

1. Install `node.js` (version >= 9.11.2), if not already installed:
   - See [instructions](https://nodejs.org/en/download/package-manager/) or google.
2. Install `git`, if not already installed:
   - See [instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) or google.
3. Download code:
   - Run/type `git clone git@github.com:djilo/platform-science.git` in terminal 
4. Enter `platform-science` project directory created by above step:
   - Run/type `cd platform-science`
5. Install package dependencies:
   - Run/type `npm install`

### Usage

1. Create two text data files, one with the list of driver names, and the other with the list of destination addresses. Each line of the drivers file should have a single driver name. Similarly, each line of the destinations file should have a single destination address. Recall that this will be a balanced assignment, so there should be the same number of drivers as there are destinations.

2. Start the application by running/typing '`npm run start`' from within the project directory (i.e. '`platform-science`').

3. The application will prompt the user to enter the filepaths to the data files created in step 1 above:

   1.  `? Enter the path to the destinations list file` :
      - Type/enter the path (e.g. `test/data/destinations.txt`)

   2.  `? Enter the path to the drivers list file` :
      - Type/enter the path (e.g. `test/data/drivers.txt`)

### Output

- The application will display on the console/terminal the total suitability score, along with the set of optimal driver/destination assignments.
- Example run:

![Example output](img/ExampleOutput.png?raw=true)

