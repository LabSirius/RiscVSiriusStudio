/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Implements the Hazard Detection Unit logic.
 * Detects load-use data hazards that require a pipeline stall.
 */
export class HazardDetectionUnit {
  /**
   * Detects if a stall is needed due to a load-use hazard.
   * @param ru_data_wr_src_ex Control signal from the instruction in the EX stage.
   * @param rd_ex Destination register of the instruction in the EX stage.
   * @param rs1_id Source register 1 of the instruction in the ID stage.
   * @param rs2_id Source register 2 of the instruction in the ID stage.
   * @returns `true` if a pipeline stall is required, `false` otherwise.
   */
  public detect(
    ru_data_wr_src_ex: string,
    rd_ex: string,
    rs1_id: string,
    rs2_id: string
  ): boolean {
    
    // A load-use hazard occurs if the instruction in the EX stage is a load...
    const isLoadInEX = ru_data_wr_src_ex === '01';

    // ...and its destination register is one of the source registers
    // for the instruction currently in the ID stage.
    if (isLoadInEX && rd_ex !== 'X' && (rd_ex === rs1_id || rd_ex === rs2_id)) {
      console.log(`[HazardDetectionUnit] LOAD-USE HAZARD DETECTED! Stalling pipeline.`);
      return true; // Stall is needed!
    }

    return false; // No stall needed.
  }
}