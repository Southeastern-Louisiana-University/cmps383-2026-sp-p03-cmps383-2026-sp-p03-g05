using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Items;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Tables;

namespace Selu383.SP26.Api.Data;

public static class SeedHelper
{
    public static async Task MigrateAndSeed(IServiceProvider serviceProvider)
    {
        var dataContext = serviceProvider.GetRequiredService<DataContext>();

        await dataContext.Database.MigrateAsync();

        await AddRoles(serviceProvider);
        await AddUsers(serviceProvider);
        await AddLocations(dataContext);
        await AddTables(dataContext);
        await AddOrderStatuses(dataContext);
        await AddMenuItems(dataContext);
        try
        {
            await AddOrders(dataContext);
        }
        catch (Exception exception)
        {
            Console.WriteLine($"Order seed skipped due to schema mismatch: {exception.Message}");
        }
    }

    private static async Task AddUsers(IServiceProvider serviceProvider)
    {
        const string defaultPassword = "Password123!";
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

        var adminUser = await userManager.FindByNameAsync("galkadi");
        if (adminUser == null)
        {
            adminUser = new User
            {
                UserName = "galkadi",
                FirstName = "Admin",
                LastName = "User",
                RewardsTotal = 0
            };
            await userManager.CreateAsync(adminUser, defaultPassword);
        }
        if (!await userManager.IsInRoleAsync(adminUser, RoleNames.Admin))
        {
            await userManager.AddToRoleAsync(adminUser, RoleNames.Admin);
        }

        var bob = await userManager.FindByNameAsync("bob");
        if (bob == null)
        {
            bob = new User
            {
                UserName = "bob",
                FirstName = "Bob",
                LastName = "Builder",
                PhoneNumber = "985-867-5309",
                RewardsTotal = 195
            };
            await userManager.CreateAsync(bob, defaultPassword);
        }
        if (!await userManager.IsInRoleAsync(bob, RoleNames.User))
        {
            await userManager.AddToRoleAsync(bob, RoleNames.User);
        }
        var shouldUpdateBob = false;
        if (bob.RewardsTotal != 195)
        {
            bob.RewardsTotal = 195;
            shouldUpdateBob = true;
        }
        if (bob.FirstName != "Bob")
        {
            bob.FirstName = "Bob";
            shouldUpdateBob = true;
        }
        if (bob.LastName != "Builder")
        {
            bob.LastName = "Builder";
            shouldUpdateBob = true;
        }
        if (bob.PhoneNumber != "985-867-5309")
        {
            bob.PhoneNumber = "985-867-5309";
            shouldUpdateBob = true;
        }
        if (shouldUpdateBob)
        {
            await userManager.UpdateAsync(bob);
        }

        var sue = await userManager.FindByNameAsync("sue");
        if (sue == null)
        {
            sue = new User
            {
                UserName = "sue",
                FirstName = "Sue",
                LastName = "Smith",
                RewardsTotal = 0
            };
            await userManager.CreateAsync(sue, defaultPassword);
        }
        if (!await userManager.IsInRoleAsync(sue, RoleNames.User))
        {
            await userManager.AddToRoleAsync(sue, RoleNames.User);
        }
    }

    private static async Task AddRoles(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();
        if (roleManager.Roles.Any())
        {
            return;
        }

        await roleManager.CreateAsync(new Role
        {
            Name = RoleNames.Admin
        });

        await roleManager.CreateAsync(new Role
        {
            Name = RoleNames.User
        });
    }

    private static async Task AddLocations(DataContext dataContext)
    {
        if (await dataContext.Set<Location>().AnyAsync())
        {
            return;
        }

        dataContext.Set<Location>().AddRange(
            new Location { Name = "Location 1", Address = "123 Main St", TableCount = 10 },
            new Location { Name = "Location 2", Address = "456 Oak Ave", TableCount = 20 },
            new Location { Name = "Location 3", Address = "789 Pine Ln", TableCount = 15 }
        );

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddOrderStatuses(DataContext dataContext)
    {
        var requiredStatuses = new[]
        {
            "Received",
            "In Progress",
            "Modified",
            "Cancelled",
            "Ready for Pickup",
            "Client in Drive Through",
            "Client in Store",
            "Completed"
        };

        var existingStatuses = await dataContext.Set<OrderStatus>()
            .Select(x => x.Name)
            .ToListAsync();

        var missingStatuses = requiredStatuses
            .Where(name => !existingStatuses.Contains(name, StringComparer.OrdinalIgnoreCase))
            .Select(name => new OrderStatus { Name = name })
            .ToList();

        if (missingStatuses.Count == 0)
        {
            return;
        }

        dataContext.Set<OrderStatus>().AddRange(missingStatuses);
        await dataContext.SaveChangesAsync();
    }

    private static async Task AddTables(DataContext dataContext)
    {
        var locations = await dataContext.Set<Location>()
            .AsNoTracking()
            .ToListAsync();

        if (locations.Count == 0)
        {
            return;
        }

        var existingTables = await dataContext.Set<Table>()
            .AsNoTracking()
            .ToListAsync();

        foreach (var location in locations)
        {
            var existingNumbers = existingTables
                .Where(x => x.LocationId == location.Id)
                .Select(x => x.Number)
                .ToHashSet();

            for (int tableNumber = 1; tableNumber <= location.TableCount; tableNumber++)
            {
                if (existingNumbers.Contains(tableNumber))
                {
                    continue;
                }

                dataContext.Set<Table>().Add(new Table
                {
                    LocationId = location.Id,
                    Number = tableNumber,
                });
            }
        }

        if (dataContext.ChangeTracker.HasChanges())
        {
            await dataContext.SaveChangesAsync();
        }
    }

    private static async Task AddMenuItems(DataContext dataContext)
    {
        var menuItemsToSeed = new List<MenuItem>
        {
            new() { ItemName = "Iced Latte", Type = "Drink", Featured = true, Price = 5.50m, Description = "Espresso and milk served over ice for a refreshing coffee drink.", Nutrition = " " },
            new() { ItemName = "Supernova", Type = "Drink", Featured = false, Price = 7.95m, Description = "A unique coffee blend with a complex, balanced profile and subtle sweetness. Delicious as espresso or paired with milk.", Nutrition = " " },
            new() { ItemName = "Roaring Frappe", Type = "Drink", Featured = false, Price = 6.20m, Description = "Cold brew, milk, and ice blended together with a signature syrup or flavor, topped with whipped cream.", Nutrition = " " },
            new() { ItemName = "Black & White Cold Brew", Type = "Drink", Featured = false, Price = 5.15m, Description = "Cold brew made with both dark and light roast beans, finished with a drizzle of condensed milk.", Nutrition = " " },
            new() { ItemName = "Strawberry Limeade", Type = "Drink", Featured = false, Price = 5.00m, Description = "Fresh lime juice blended with strawberry puree for a refreshing, tangy drink.", Nutrition = " " },
            new() { ItemName = "Shaken Lemonade", Type = "Drink", Featured = false, Price = 5.00m, Description = "Fresh lemon juice and simple syrup vigorously shaken for a bright, refreshing lemonade.", Nutrition = " " },

            new() { ItemName = "Mannino Honey Crepe", Type = "Food", Featured = false, Price = 10.00m, Description = "A sweet crepe drizzled with Mannino honey and topped with mixed berries.", Nutrition = " " },
            new() { ItemName = "Downtowner", Type = "Food", Featured = false, Price = 10.75m, Description = "Strawberries and bananas wrapped in a crepe, finished with Nutella and Hershey's chocolate sauce.", Nutrition = " " },
            new() { ItemName = "Funky Monkey", Type = "Food", Featured = false, Price = 10.00m, Description = "Nutella and bananas wrapped in a crepe, served with whipped cream.", Nutrition = " " },
            new() { ItemName = "Le S'mores", Type = "Food", Featured = false, Price = 9.50m, Description = "Marshmallow cream and chocolate sauce inside a crepe, topped with graham cracker crumbs.", Nutrition = " " },
            new() { ItemName = "Strawberry Fields", Type = "Food", Featured = true, Price = 10.00m, Description = "Fresh strawberries with Hershey's chocolate drizzle and a dusting of powdered sugar.", Nutrition = " " },
            new() { ItemName = "Bonjour", Type = "Food", Featured = false, Price = 8.50m, Description = "A sweet crepe filled with syrup and cinnamon, finished with powdered sugar.", Nutrition = " " },
            new() { ItemName = "Banana Foster", Type = "Food", Featured = false, Price = 8.95m, Description = "Bananas with cinnamon in a crepe, topped with a generous drizzle of caramel sauce.", Nutrition = " " },

            new() { ItemName = "Matt's Scrambled Eggs", Type = "Food", Featured = false, Price = 5.00m, Description = "Scrambled eggs and melted mozzarella cheese wrapped in a crepe.", Nutrition = " " },
            new() { ItemName = "Meanie Mushroom", Type = "Food", Featured = false, Price = 10.50m, Description = "Sauteed mushrooms, mozzarella, tomato, and bacon inside a delicate crepe.", Nutrition = " " },
            new() { ItemName = "Turkey Club", Type = "Food", Featured = false, Price = 10.50m, Description = "Sliced turkey, bacon, spinach, and tomato wrapped in a savory crepe.", Nutrition = " " },
            new() { ItemName = "Green Machine", Type = "Food", Featured = false, Price = 10.00m, Description = "Spinach, artichokes, and mozzarella cheese inside a fresh crepe.", Nutrition = " " },
            new() { ItemName = "Perfect Pair", Type = "Food", Featured = false, Price = 10.00m, Description = "A unique combination of bacon and Nutella wrapped in a crepe.", Nutrition = " " },
            new() { ItemName = "Crepe Fromage", Type = "Food", Featured = false, Price = 8.00m, Description = "A savory crepe filled with a blend of cheeses.", Nutrition = " " },
            new() { ItemName = "Farmers Market Crepe", Type = "Food", Featured = false, Price = 10.50m, Description = "Turkey, spinach, and mozzarella wrapped in a savory crepe.", Nutrition = " " },

            new() { ItemName = "Travis Special", Type = "Food", Featured = true, Price = 14.00m, Description = "Cream cheese, salmon, spinach, and a fried egg served on a freshly toasted bagel.", Nutrition = " " },
            new() { ItemName = "Creme Brulagel", Type = "Food", Featured = false, Price = 8.00m, Description = "A toasted bagel with a caramelized sugar crust inspired by creme brulee, served with cream cheese.", Nutrition = " " },
            new() { ItemName = "The Fancy One", Type = "Food", Featured = false, Price = 13.00m, Description = "Smoked salmon, cream cheese, and fresh dill on a toasted bagel.", Nutrition = " " },
            new() { ItemName = "Breakfast Bagel", Type = "Food", Featured = false, Price = 9.50m, Description = "A toasted bagel with your choice of ham, bacon, or sausage, a fried egg, and cheddar cheese.", Nutrition = " " },
            new() { ItemName = "The Classic", Type = "Food", Featured = false, Price = 5.25m, Description = "A toasted bagel with cream cheese.", Nutrition = " " },
        };

        var existingItems = await dataContext.Set<MenuItem>()
            .ToListAsync();

        var existingByKey = existingItems.ToDictionary(
            x => $"{x.Type}|{x.ItemName}",
            StringComparer.OrdinalIgnoreCase);

        foreach (var seedItem in menuItemsToSeed)
        {
            var key = $"{seedItem.Type}|{seedItem.ItemName}";

            if (!existingByKey.TryGetValue(key, out var existingItem))
            {
                dataContext.Set<MenuItem>().Add(seedItem);
                continue;
            }

            existingItem.Price = seedItem.Price;
            existingItem.Description = seedItem.Description;
            existingItem.Nutrition = seedItem.Nutrition;
            existingItem.Featured = seedItem.Featured;
        }

        if (dataContext.ChangeTracker.HasChanges())
        {
            await dataContext.SaveChangesAsync();
        }
    }

    private static async Task AddOrders(DataContext dataContext)
    {
        await EnsureLegacyOrdersDefaults(dataContext);

        var bob = await dataContext.Users
            .FirstOrDefaultAsync(x => x.UserName == "bob");
        if (bob == null)
        {
            return;
        }

        var location1Id = await dataContext.Set<Location>()
            .Where(x => x.Name == "Location 1")
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (location1Id == 0)
        {
            location1Id = await dataContext.Set<Location>()
                .OrderBy(x => x.Id)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();
        }

        if (location1Id == 0)
        {
            return;
        }

        var completedStatusId = await dataContext.Set<OrderStatus>()
            .Where(x => x.Name == "Completed")
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (completedStatusId == 0)
        {
            return;
        }

        var requiredItemNames = new[]
        {
            "Iced Latte",
            "Black & White Cold Brew",
            "Downtowner",
            "Travis Special",
        };

        var seededMenuItems = await dataContext.Set<MenuItem>()
            .Where(x => requiredItemNames.Contains(x.ItemName))
            .Select(x => new { x.ItemName, x.Id })
            .ToListAsync();

        var menuItemIdsByName = seededMenuItems
            .ToDictionary(x => x.ItemName, x => x.Id, StringComparer.OrdinalIgnoreCase);

        if (menuItemIdsByName.Count < requiredItemNames.Length)
        {
            return;
        }

        var targetOrders = new[]
        {
            new
            {
                DateOrdered = new DateTime(2026, 4, 1, 12, 0, 0, DateTimeKind.Utc),
                PickupMethod = "Drive Through",
                ItemNames = new[] { "Iced Latte" },
            },
            new
            {
                DateOrdered = new DateTime(2026, 4, 5, 12, 0, 0, DateTimeKind.Utc),
                PickupMethod = "In Store",
                ItemNames = new[] { "Black & White Cold Brew", "Downtowner" },
            },
            new
            {
                DateOrdered = new DateTime(2026, 4, 10, 12, 0, 0, DateTimeKind.Utc),
                PickupMethod = "In Store",
                ItemNames = new[] { "Travis Special" },
            },
        };

        foreach (var targetOrder in targetOrders)
        {
            var existingOrder = await dataContext.Set<Order>()
                .Include(x => x.OrderMenuItems)
                .FirstOrDefaultAsync(x =>
                    x.UserId == bob.Id &&
                    x.DateOrdered == targetOrder.DateOrdered);

            if (existingOrder == null)
            {
                existingOrder = new Order
                {
                    UserId = bob.Id,
                    LocationId = location1Id,
                    OrderStatusId = completedStatusId,
                    PickupMethod = targetOrder.PickupMethod,
                    DateOrdered = targetOrder.DateOrdered,
                };

                dataContext.Set<Order>().Add(existingOrder);
            }
            else
            {
                existingOrder.LocationId = location1Id;
                existingOrder.OrderStatusId = completedStatusId;
                existingOrder.PickupMethod = targetOrder.PickupMethod;
                existingOrder.DateOrdered = targetOrder.DateOrdered;

                dataContext.Set<OrderMenuItem>().RemoveRange(existingOrder.OrderMenuItems);
                existingOrder.OrderMenuItems.Clear();
            }

            foreach (var itemName in targetOrder.ItemNames)
            {
                existingOrder.OrderMenuItems.Add(new OrderMenuItem
                {
                    MenuItemId = menuItemIdsByName[itemName],
                    Quantity = 1,
                });
            }
        }

        if (dataContext.ChangeTracker.HasChanges())
        {
            await dataContext.SaveChangesAsync();
        }
    }

    private static async Task EnsureLegacyOrdersDefaults(DataContext dataContext)
    {
        await dataContext.Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('Orders', 'CreatedAtUtc') IS NOT NULL
            BEGIN
                DECLARE @DefaultConstraintName nvarchar(128);

                SELECT @DefaultConstraintName = dc.name
                FROM sys.default_constraints dc
                JOIN sys.columns c ON c.default_object_id = dc.object_id
                JOIN sys.tables t ON t.object_id = c.object_id
                WHERE t.name = 'Orders' AND c.name = 'CreatedAtUtc';

                IF @DefaultConstraintName IS NULL
                BEGIN
                    ALTER TABLE [Orders]
                    ADD CONSTRAINT [DF_Orders_CreatedAtUtc_Seed] DEFAULT SYSUTCDATETIME() FOR [CreatedAtUtc];
                END
            END
            """);
    }
}
