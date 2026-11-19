"""
Traffic coordination and guaranteed collision prevention for multi-AGV warehouse fleet.
"""

from typing import Dict, List, Tuple, Set
from backend.simulation.robot import AGVRobot, MovementStatus


class TrafficCoordinator:
    """
    Coordinates simultaneous AGV robot movements using an iterative relaxation algorithm.
    Guarantees:
    1. Zero vertex collisions: len(approved_moves.values()) == len(set(approved_moves.values()))
    2. Zero swap collisions: not (approved[A] == pos[B] and approved[B] == pos[A])
    3. Zero stationary intrusions: No robot enters a cell held by a stationary robot.
    """

    @staticmethod
    def resolve_conflicts(
        robots: Dict[str, AGVRobot]
    ) -> Dict[str, Tuple[int, int]]:
        """
        Determines the approved next position for every robot for the current tick.
        Guarantees that no two robots occupy the same grid cell at the same time.
        """
        current_positions = {r_id: robot.position for r_id, robot in robots.items()}
        
        # Initial intended moves along BFS path
        tentative_moves: Dict[str, Tuple[int, int]] = {}
        for r_id, robot in robots.items():
            if robot.movement_status == MovementStatus.CHARGING:
                # Stationary while actively recharging
                tentative_moves[r_id] = current_positions[r_id]
            else:
                tentative_moves[r_id] = robot.next_cell()

        # Priority score: Higher priority value wins; tie-break with robot_id
        priorities = {r_id: (robots[r_id].priority, -int(r_id.split('-')[-1].replace('B', '99') if '-' in r_id and r_id.split('-')[-1].replace('B','').isdigit() else 0)) for r_id in robots}

        def lower_priority(id_a: str, id_b: str) -> str:
            if priorities[id_a] < priorities[id_b]:
                return id_a
            return id_b

        # Iterative conflict resolution until fixed-point convergence
        changed = True
        max_iterations = len(robots) + 2
        iteration = 0

        while changed and iteration < max_iterations:
            changed = False
            iteration += 1

            # Check 1: Target cell collisions (two robots wanting same destination)
            target_claims: Dict[Tuple[int, int], List[str]] = {}
            for r_id, target in tentative_moves.items():
                target_claims.setdefault(target, []).append(r_id)

            for target, claimants in target_claims.items():
                if len(claimants) > 1:
                    # Sort claimants by priority descending
                    sorted_claimants = sorted(claimants, key=lambda cid: priorities[cid], reverse=True)
                    # Winner keeps target, all others revert to current position
                    for loser_id in sorted_claimants[1:]:
                        if tentative_moves[loser_id] != current_positions[loser_id]:
                            tentative_moves[loser_id] = current_positions[loser_id]
                            changed = True

            # Check 2: Head-on swap collisions (A -> pos_B and B -> pos_A)
            robot_ids = list(tentative_moves.keys())
            for i in range(len(robot_ids)):
                for j in range(i + 1, len(robot_ids)):
                    id_a, id_b = robot_ids[i], robot_ids[j]
                    pos_a, pos_b = current_positions[id_a], current_positions[id_b]
                    target_a, target_b = tentative_moves[id_a], tentative_moves[id_b]

                    if target_a == pos_b and target_b == pos_a:
                        # Head-on swap! The lower-priority robot must yield and hold
                        loser_id = lower_priority(id_a, id_b)
                        if tentative_moves[loser_id] != current_positions[loser_id]:
                            tentative_moves[loser_id] = current_positions[loser_id]
                            changed = True

            # Check 3: Chained stationary block
            # If robot A wants to move into robot B's cell, but robot B is not vacating that cell
            for r_id, target in list(tentative_moves.items()):
                if target != current_positions[r_id]:
                    # Target is occupied by another robot that is holding that cell
                    for other_id, other_pos in current_positions.items():
                        if other_id != r_id and other_pos == target:
                            if tentative_moves[other_id] == target:
                                # Occupant is staying; r_id cannot enter
                                tentative_moves[r_id] = current_positions[r_id]
                                changed = True
                                break

        # Update movement status for robots that were forced to wait
        for r_id, robot in robots.items():
            approved = tentative_moves[r_id]
            if approved == current_positions[r_id]:
                if robot.route and len(robot.route) > 1 and robot.movement_status not in (MovementStatus.CHARGING, MovementStatus.COMPLETED):
                    robot.movement_status = MovementStatus.WAITING

        return tentative_moves
