# Lichess Team Battle Manager

A simple tool utilizing Lichess API to manage regular
Lichess Team Battles. As of now, it's highly customized for
[World Classicals](https://lichess.org/team/world-classicals) Team Battles.

## Usage

```txt
ltbm <command>

Commands:
  ltbm check [tournamentId]   Check registered teams for the provided tournament
                              ID.
  ltbm list [tournamentId]    List teams.
  ltbm invite [tournamentId]  Send invitations to team leaders for the provided
                              tournament.
  ltbm suggest                Suggest potential team leaders to contact for new
                              teams (Teams Sheet).

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```
