# Lichess Team Battle Manager

A simple tool utilizing Lichess API to manage regular
Lichess Team Battles. As of now, tt's highly customized for
[World Classicals](https://lichess.org/team/world-classicals) Team Battles.

## Usage

```txt
ltbm <command>

Commands:
  ltbm check [tournamentId]   Check existing tournament teams.
  ltbm list [tournamentId]    List existing tournament teams.
  ltbm invite [tournamentId]  Send invitations to team leaders for the next
                              tournament.

Options:
      --help          Show help                                        [boolean]
      --version       Show version number                              [boolean]
      --tournamentId  Tournament ID.                         [string] [required]
  -x, --excluded      List only excluded teams.       [boolean] [default: false]
  -n, --new           List only new teams.            [boolean] [default: false]
```
