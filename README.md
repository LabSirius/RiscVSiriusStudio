# RISC-V Simulator for VS Code

[![Download extension](https://img.shields.io/badge/Download-.vsix-blue?style=for-the-badge&logo=visualstudiocode)](https://github.com/LabSirius/RiscVSiriusStudio/releases/download/v1.0/rv-simulator-1.0.0.vsix)
[![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)](https://github.com/LabSirius/RiscVSiriusStudio/releases)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](LICENSE.md)

An interactive RISC-V assembly simulator with memory views, stepped execution, and code visualization for Visual Studio Code, primarily designed for educational purposes.

## Educational Purpose

This simulator is specifically targeted for teaching and learning the RISC-V architecture:

- **For Students**: Provides an interactive environment to explore and
  understand the RISC-V instruction set, memory operations, and program
  execution flow.
- **For Educators**: Offers a powerful tool to demonstrate important computer
  organization concepts, and architectural principles.
- **For Classrooms**: Enables hands-on learning experiences with immediate
  visual feedback on program execution.

The visual representation and step-by-step execution make abstract computer
architecture concepts tangible and easier to comprehend.

## Features

- **Syntax Highlighting**: Full syntax highlighting for RISC-V assembly (.asm)
  files.
- **Interactive Simulation**: Run and step through RISC-V programs directly in
  VS Code.
- **Memory Views**: Inspect program memory and data memory during simulation.
- **Register Monitoring**: Track register values and changes during execution.

## Installation

### From VS Code Marketplace

The extension is still not available in the marketplace. 

### Manual Installation
1. Download the latest .vsix file from [here](https://github.com/LabSirius/RiscVSiriusStudio/releases/download/v1.0/rv-simulator-1.0.0.vsix).
2. In VS Code, go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu and select "Install from VSIX..."
4. Select the downloaded .vsix file

## Usage

1. Open or create a RISC-V assembly file (.asm)
2. Use the toolbar buttons or commands to:
   - Build your program 
   - Simulate program execution (this will launch the graphic simulator)

## Requirements

- Visual Studio Code version 1.75.0 or higher

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Developed by the Sirius Lab team at Universidad Tecnológica de Pereira
- Special thanks to all contributors who have helped make this extension better
