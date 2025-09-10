/* eslint-disable @typescript-eslint/naming-convention */


export enum ForwardingSource {
  FROM_REGISTER, // Default: Use the value read from the register file in the ID stage.
  FROM_MEM_STAGE,  // Forward the ALU result from the MEM stage.
  FROM_WB_STAGE,   // Forward the final result from the WB stage.
}

// Defines the output signals from the Forwarding Unit.
export interface ForwardingSignals {
  forwardA: ForwardingSource; //RS1
  forwardB: ForwardingSource; //RS2
}

/**
 * Implements the Forwarding Unit logic.
 * Detects data hazards between EX, MEM, and WB stages and determines
 * if data needs to be forwarded to the ALU inputs.
 */
export class ForwardingUnit {
  public detect(
    // Source registers for the instruction in the EX stage
    rs1_ex: string,
    rs2_ex: string,
    // Destination register for the instruction in the MEM stage
    rd_me: string,
    ru_wr_me: boolean,
    // Destination register for the instruction in the WB stage
    rd_wb: string,
    ru_wr_wb: boolean
  ): ForwardingSignals {
    
    // Default: No forwarding needed.
    const signals: ForwardingSignals = {
      forwardA: ForwardingSource.FROM_REGISTER,
      forwardB: ForwardingSource.FROM_REGISTER,
    };

    // --- Logic for Operand A (rs1) ---

    // Hazard with MEM stage: If the instruction in MEM writes to a register (ru_wr_me)
    // and that register (rd_me) is the one we need for rs1, we must forward.
    // This has priority because it's a "newer" result than the one in WB.
    if (ru_wr_me && rd_me !== "X" && rd_me !== "0" && rd_me === rs1_ex) {
      signals.forwardA = ForwardingSource.FROM_MEM_STAGE;
    }
    // Hazard with WB stage: If there's no hazard with MEM, check WB.
    // If the instruction in WB writes to a register and that's the one we need.
    else if (ru_wr_wb && rd_wb !== "X" && rd_wb !== "0" && rd_wb === rs1_ex) {
      signals.forwardA = ForwardingSource.FROM_WB_STAGE;
    }

    // --- Logic for Operand B (rs2) ---

    // Hazard with MEM stage
    if (ru_wr_me && rd_me !== "X" && rd_me !== "0" && rd_me === rs2_ex) {
      signals.forwardB = ForwardingSource.FROM_MEM_STAGE;
    }
    // Hazard with WB stage
    else if (ru_wr_wb && rd_wb !== "X" && rd_wb !== "0" && rd_wb === rs2_ex) {
      signals.forwardB = ForwardingSource.FROM_WB_STAGE;
    }

    // --- Verification Log ---
    if (signals.forwardA !== ForwardingSource.FROM_REGISTER || signals.forwardB !== ForwardingSource.FROM_REGISTER) {
        console.log(`[ForwardingUnit] HAZARD DETECTED! Decisions: ForwardA=${ForwardingSource[signals.forwardA]}, ForwardB=${ForwardingSource[signals.forwardB]}`);
    }

    return signals;
  }
}